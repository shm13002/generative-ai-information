import subprocess,json,os
src=open('build.py').read().split('segs=[]')[0]; exec(src)
import sys; CFG=json.load(open(sys.argv[1])); S=CFG['src']; ND=B+'/'+CFG['key']; os.makedirs(ND,exist_ok=True)
EV=[tuple(e) for e in CFG['ev']]
def caps(D,speed=1.0):
    out=[]
    for k,(t,tx) in enumerate(EV):
        nxt=EV[k+1][0] if k+1<len(EV) else CFG['end']
        out.append((t/speed/D,min(nxt,t+4.0)/speed/D,tx))
    return out
def vclip(out,speed,label,cp):
    D=dur(S)/speed
    vf=['setpts=PTS/%s'%speed,'scale=1920:1080:force_original_aspect_ratio=decrease','pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0d12','fps=30',
        f"drawtext=fontfile={F}:text='MOTION-DESIGN PROMO (not a live screen recording)':fontsize=22:fontcolor=white@0.6:x=30:y=24",
        f"drawtext=fontfile={FB}:text='{esc(label)}':fontsize=34:fontcolor=yellow:x=30:y=60",
        f"drawtext=fontfile={F}:text='src %{{eif\\:t*{speed}\\:d}}.%{{eif\\:mod(t*{speed}*10\\,10)\\:d}}s':fontsize=28:fontcolor=white@0.8:x=w-tw-30:y=60"]
    for a,b,tx in cp:
        vf.append(f"drawtext=fontfile={FB}:text='{esc(tx)}':fontsize=38:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=18:x=(w-tw)/2:y=h-120:enable='between(t,{a*D:.2f},{b*D:.2f})'")
    af='atempo=0.5,atempo=0.5' if speed==0.25 else 'anull'
    run(['-i',S,'-vf',','.join(vf),'-af',af]+ENC+[out])
segs=[]
p=ND+'/n0.mp4'; card(p,[(CFG['title'],60,'white'),(CFG['who'],34,'0xbfc6d4'),(CFG['url'],30,'0x7fb2ff'),('Normal speed > 0.25x > freeze frames. Captions at measured moments.',28,'0x9aa3b2')],4); segs.append((p,'Hundred-tasks deep-dive: title'))
p=ND+'/n1.mp4'; vclip(p,1.0,''+CFG['tag']+' 1/3: normal speed',caps(dur(S))); segs.append((p,'Hundred-tasks deep-dive: normal speed'))
p=ND+'/n2.mp4'; vclip(p,0.25,''+CFG['tag']+' 2/3: 0.25x slow motion',caps(dur(S)/0.25,0.25)); segs.append((p,'Hundred-tasks deep-dive: 0.25x'))
p=ND+'/n3.mp4'; card(p,[(''+CFG['tag']+' 3/3: freeze frames at each state change',52,'white')],2.5); segs.append((p,'Hundred-tasks deep-dive: freeze frames'))
FR=CFG['fr']
for i,(ft,(t,tx)) in enumerate(zip(FR,EV)):
    p=ND+f'/f{i:02d}.mp4'
    vf=f"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0d12,drawtext=fontfile={FB}:text='FREEZE  {i+1}/{len(EV)}   src {ft:.2f}s (event at {t:.1f}s)':fontsize=34:fontcolor=yellow:x=30:y=60,drawtext=fontfile={FB}:text='{esc(tx)}':fontsize=38:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=18:x=(w-tw)/2:y=h-120"
    run(['-ss',str(ft),'-i',S,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-frames:v','1','-update','1',ND+'/still.png'])
    run(['-loop','1','-t','2.8','-i',ND+'/still.png','-f','lavfi','-t','2.8','-i','anullsrc=r=48000:cl=stereo','-vf',vf]+ENC+['-shortest',p]); segs.append((p,None))
json.dump(segs,open(ND+'/segs.json','w'))
open(ND+'/log.json','w').write(json.dumps(EV))
