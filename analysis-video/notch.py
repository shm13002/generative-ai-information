import subprocess,json,os
src=open('build.py').read().split('segs=[]')[0]; exec(src)
S=G+'/v5-oct13-notch/video.mp4'; ND=B+'/notch'; os.makedirs(ND,exist_ok=True)
EV=[(0.0,'CLOSED: idle notch, small pill with a glowing orb'),
(0.3,'EXPAND: notch grows into an alert banner "Northwind may not renew"'),
(3.1,'COLLAPSE: banner retracts back into the notch'),
(3.6,'VOICE TRIGGER: user speaks, live waveform in the notch ("What happened?")'),
(4.3,'MORPH: notch fills with a glow bar = agent thinking'),
(4.7,'STATUS: "Reading Gmail, HubSpot, LinkedIn" with source icons'),
(5.4,'MORPH: notch drops down into a dark card panel'),
(5.7,'CONTENT ARRIVES: header first, then rows stream in one by one'),
(11.3,'RESHAPE: card morphs into a person card (Tomas Rivera)'),
(15.3,'CONTENT LEAVES: card collapses up into the notch'),
(15.9,'MORPH: orb drips out of the notch (gooey blob) to go use apps'),
(16.5,'Agent drives apps: calendar and email draft windows open'),
(23.0,'APPROVAL CARD in notch: "Send this to Tomas Rivera?"'),
(24.6,'User clicks "Allow once" - approval card fades out'),
(25.2,'Orb travels back up into the notch'),
(25.6,'MORPH: notch glows and expands'),
(26.0,'CONFIRMATION: "Sent to Tomas - Thursday 10:00 held"'),
(28.5,'CLOSED again; time-lapse (Tue > Wed > Thu)'),
(32.0,'EXPAND: proactive alert "Tomas signed - 2 years"'),
(32.5,'COLLAPSE into glow bar'),
(32.9,'STATUS CHIP in closed notch: "Signed"'),
(33.0,'Orb drops out of the notch and inflates into a card'),
(33.5,'CONTENT ARRIVES: order form, signature draws in'),
(36.3,'CONTENT LEAVES: card shrinks back into the orb'),
(36.8,'Orb rises into the notch; glow bar, then CLOSED'),
(37.9,'End card: "Your notch is now Jarvis."')]
def caps(D,speed=1.0):
    out=[]
    for k,(t,tx) in enumerate(EV):
        nxt=EV[k+1][0] if k+1<len(EV) else 45.05
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
p=ND+'/n0.mp4'; card(p,[('Notch deep-dive',60,'white'),('Ahmad Hajj (@ahmadafterhours) - Oct 13, 2026 ET',34,'0xbfc6d4'),('x.com/ahmadafterhours/status/2110152973741654405',30,'0x7fb2ff'),('Normal speed > 0.25x > freeze frames. Captions at measured moments.',28,'0x9aa3b2')],4); segs.append((p,'Notch deep-dive: title'))
p=ND+'/n1.mp4'; vclip(p,1.0,'NOTCH 1/3: normal speed',caps(dur(S))); segs.append((p,'Notch deep-dive: normal speed'))
p=ND+'/n2.mp4'; vclip(p,0.25,'NOTCH 2/3: 0.25x slow motion',caps(dur(S)/0.25,0.25)); segs.append((p,'Notch deep-dive: 0.25x'))
p=ND+'/n3.mp4'; card(p,[('NOTCH 3/3: freeze frames at each state change',52,'white')],2.5); segs.append((p,'Notch deep-dive: freeze frames'))
FR=[0.05,0.5,3.2,3.9,4.5,4.8,5.5,6.5,11.6,15.35,16.2,17.5,24.1,24.6,25.3,25.8,26.3,29.5,32.2,32.6,32.95,33.3,34.5,36.4,37.0,38.5]
for i,(ft,(t,tx)) in enumerate(zip(FR,EV)):
    p=ND+f'/f{i:02d}.mp4'
    vf=f"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0d12,drawtext=fontfile={FB}:text='FREEZE  {i+1}/{len(EV)}   src {ft:.2f}s (event at {t:.1f}s)':fontsize=34:fontcolor=yellow:x=30:y=60,drawtext=fontfile={FB}:text='{esc(tx)}':fontsize=38:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=18:x=(w-tw)/2:y=h-120"
    run(['-ss',str(ft),'-i',S,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-frames:v','1','-update','1',ND+'/still.png'])
    run(['-loop','1','-t','2.8','-i',ND+'/still.png','-f','lavfi','-t','2.8','-i','anullsrc=r=48000:cl=stereo','-vf',vf]+ENC+['-shortest',p]); segs.append((p,None))
json.dump(segs,open(ND+'/segs.json','w'))
open(ND+'/log.json','w').write(json.dumps(EV))
