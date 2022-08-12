# Copyright (c) advancedfx.org
#
# Last changes:
# 2016-06-28 by dominik.matrixstorm.com
#
# First changes:
# 2009-09-03 by dominik.matrixstorm.com


# 57.29577951308232087679815481410...
RAD2DEG = 57.2957795130823208767981548141



import sfm;
import sfmUtils;
import sfmApp;
from PySide import QtGui


def SetError(error):
	print 'ERROR:', error
	QtGui.QMessageBox.warning( None, "ERROR:", error )


# <summary> Formats a float value to be suitable for bvh output </summary>
def FloatToBvhString(value):
	return "{0:f}".format(value)


def WriteHeader(file, frames, frameTime):
	file.write("HIERARCHY\n")
	file.write("ROOT MdtCam\n")
	file.write("{\n")
	file.write("\tOFFSET 0.00 0.00 0.00\n")
	file.write("\tCHANNELS 1 Xposition(FOV) \n")
	file.write("\tEnd Site\n")
	file.write("\t{\n")
	file.write("\t\tOFFSET 0.00 0.00 -1.00\n")
	file.write("\t}\n")
	file.write("}\n")
	file.write("MOTION\n")
	file.write("Frames: "+str(frames)+"\n")
	file.write("Frame Time: "+FloatToBvhString(frameTime)+"\n")
	
def LimDeg(val):
	return val

def WriteFile(fileName, scale):
	shot = sfm.GetCurrentShot()
	animSet = sfm.GetCurrentAnimationSet()
	
	dag = sfm.FindDag("transform")
	
	if dag == None:
		SetError("Selected animation set does not have transform DAG node.")
		return False
	
	fps = sfmApp.GetFramesPerSecond()
	frameTime = fps
	if not 0 == frameTime:
		frameTime = 1.0/float(frameTime)
	frameCount = shot.GetDuration().CurrentFrame(vs.DmeFramerate_t(fps))
	
	file = open(fileName)
	if not file:
		SetError('Could not open file '+fileName+' for writing')
		return False

	oldFrame = sfm.GetCurrentFrame()
	try:

		curFrame = 0
		is_data_row = False
		replacement = ""
		for line in file:
			line = line.strip()
			if "CHANNELS 6" in line:
				changes = line.replace("6", "7") + " Fov"
			elif is_data_row:
				sfm.SetCurrentFrame(curFrame)
				X = sfm.GetPosition("transform", space="RefObject")[0]
				curFrame += 1
				changes = line + " " + FloatToBvhString(X)
			else:
				changes = line
			if "Frame Time" in line:
				is_data_row = True
			replacement += changes + "\n"

		file.close()

		file = open(fileName, "w")
		file.write(replacement)
		
			
				
	finally:
		file.close()
		sfm.SetCurrentFrame(oldFrame)
	
	if not curFrame == frameCount:
		SetError("Could not write all frames." + str(curFrame) + " " + str(frameCount))
		return False
	
	return True


def ExportCamera():
	fileName, _ = QtGui.QFileDialog.getSaveFileName(None, "Select existing BVH file with pos and rot.",  "", "HLAE BVH (*.bvh)")
	if not 0 < len(fileName):
		return
	
	sfm.SetOperationMode( "Play" )
	
	try:
		if WriteFile(fileName, 1.0):
			print 'Done.'
		else:
			print 'FAILED'
	finally:
		sfm.SetOperationMode( "Pass" )


ExportCamera()