# Usage
## Export pos + rot:
- Export main camera like normal with export_bvh.py to create a file with camera position and rotation information.
## Export fov:
- Open FOV in graph editor for main camera.
- Go to the first key point.
- Select all & copy.
- Open position X for secondary camera.
- Click the bar below the bottom of the screen (in order to not change the playhead position).
- Paste.
- Export secondary camera with export_fov_bvh.py, make sure to select the same bvh you exported for the main camera.
## Import pos + rot + fov:
- Use the AE script, you only need to change the default fov values if you used "remap slider range" in SFM.
## Export + Import video:
- Default mp4 export from SFM works, but length is mismatched to AE camera.
- Try exporting as image sequence instead, or use `ffmpeg -r <frame rate> -i in.mp4 -c:v prores_ks -c:a pcm_s24le output.mov`. 
- Import to AE and align with the first camera keypoint.
