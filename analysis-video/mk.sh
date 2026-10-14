#!/bin/bash
set -e; cd /workspace/genui/analysis-video; cfg=$1; out=$2; key=$(python3 -c "import json;print(json.load(open('$cfg'))['key'])")
python3 deep.py $cfg
B=build/$key; python3 -c "import json;print(''.join(f\"file '{p}'\n\" for p,_ in json.load(open('$B/segs.json'))))" > $B/list.txt
ffmpeg -y -v error -f concat -safe 0 -i $B/list.txt -c copy $B/full.mp4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $B/full.mp4); VB=$(python3 -c "print(int(24.0*8e6/$D/1000-56))")
cd $B; ffmpeg -y -v error -i full.mp4 -c:v libx264 -preset slow -b:v ${VB}k -pass 1 -an -f mp4 /dev/null; ffmpeg -y -v error -i full.mp4 -c:v libx264 -preset slow -b:v ${VB}k -pass 2 -c:a aac -b:a 48k -movflags +faststart ../../$out
ffprobe -v error -show_entries format=duration,size -of csv=p=0 ../../$out
