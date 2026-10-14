set -e; cd /workspace/genui/analysis-video
python3 rebuild.py
cd build; ffmpeg -y -v error -f concat -safe 0 -i list4.txt -c copy -movflags +faststart ../Agently-Analysis.mp4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 ../Agently-Analysis.mp4); VB=$(python3 -c "print(int(24.0*8e6/$D/1000-33))"); echo D=$D VB=$VB
ffmpeg -y -v error -i ../Agently-Analysis.mp4 -vf scale=854:480,fps=15 -c:v libx264 -preset slow -b:v ${VB}k -pass 1 -passlogfile sm -an -f mp4 /dev/null
ffmpeg -y -v error -i ../Agently-Analysis.mp4 -vf scale=854:480,fps=15 -c:v libx264 -preset slow -b:v ${VB}k -pass 2 -passlogfile sm -c:a aac -b:a 32k -ac 1 -movflags +faststart ../Agently-Analysis-small.mp4
cd ..; rm -rf parts; mkdir parts
SZ=$(stat -c%s Agently-Analysis.mp4); N=$(python3 -c "import math;print(math.ceil($SZ/88e6))"); SEG=$(python3 -c "print($D/$N)")
ffmpeg -y -v error -i Agently-Analysis.mp4 -c copy -map 0 -f segment -segment_time $SEG -reset_timestamps 1 -movflags +faststart parts/Agently-Analysis-part%02d.mp4
ls -la parts; for f in parts/*; do ffprobe -v error -show_entries format=duration -of csv=p=0 $f; done; echo FINALDONE
