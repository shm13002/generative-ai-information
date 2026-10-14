import json,subprocess,os,re
src=open('build.py').read()
pre=src.split("segs=[]")[0]; exec(pre)   # defines C, CAP, card, clip, dur, etc.
O_='omarships'; A_='ahmadafterhours'
C=[list(c) for c in C]
C[26][1:5]=[O_,'2107652407823827106','Oct 6, 2026','We reinvented interfaces for the agent era']
C[28][1:5]=[A_,'2107996181150281948','Oct 7, 2026','Reinvented how you run your company (company video)']
CAP['launch']=[(.05,'Live-action brand film: no product UI is shown'),(.37,'Text: "not everything needs you."'),(.52,'Text: "we will handle everything and tell you what does."'),(.72,'agently.dev > Agently logo')]
NEWC=[G+'/analysis-video/new/2102964978160382144.mp4',O_,'2102964978160382144','Sep 23, 2026','Introducing agently.dev (launch film)','launch']
old_b={i+1:B+f'/{i+1:02d}b.mp4' for i in range(len(C))}
order=[(c,old_b[i+1]) for i,c in enumerate(C)]
order.insert(3,(NEWC,None))
R=B+'/r'; os.makedirs(R,exist_ok=True)
segs=[]; chap=[]; T=0.0
def add(p,title=None,note=''):
    global T
    if title: chap.append((T,title,note))
    segs.append(p); T+=dur(p)
card(R+'/00_intro.mp4',[('Agently "Jarvis" Generative UI - Analysis Compilation',58,'white'),('8 deep-dives, then 40 promo/demo videos from X (Sep 18 - Oct 13, 2026), then 0.25x replays',34,'0xbfc6d4'),('Note: these are motion-design promos, not live screen recordings. Timings are from Agently app code.',30,'yellow')],6)
add(R+'/00_intro.mp4','Intro','Scope and caveat')
for name in ['notch','hundred','ontology_build','selfdesign_build','interrupt_build','reinvented_build','appsdead_build','launch_build']:
    ns=json.load(open(f'{B}/{name}/segs.json'))
    t0=ns[0][0]; ttl=['Notch','Hundred-tasks','Ontology','Self-designing UI','Interrupt','Reinvented interfaces','Apps are dead','Launch film (Sep 23)'][['notch','hundred','ontology_build','selfdesign_build','interrupt_build','reinvented_build','appsdead_build','launch_build'].index(name)]
    for j,(p,_) in enumerate(ns):
        add(p,{0:f'Deep-dive: {ttl}',1:f'Deep-dive: {ttl} - normal speed',2:f'Deep-dive: {ttl} - 0.25x',3:f'Deep-dive: {ttl} - freeze frames'}.get(j),'')
N=len(order)
for i,(c,bf) in enumerate(order,1):
    s,au,pid,dt,ti,tag=c
    link=f'x.com/{au}/status/{pid}'
    who={A_:'Ahmad Hajj (@ahmadafterhours, co-founder)',O_:'Omar Ghandour (@omarships, co-founder)'}[au]
    tc=R+f'/{i:02d}a.mp4'; card(tc,[(f'{i:02d}. {ti}',56,'white'),(f'{who}  -  {dt} ET',34,'0xbfc6d4'),(link,30,'0x7fb2ff'),(f'Focus: {tag}',28,'0x9aa3b2')])
    if bf is None: bf=R+'/launch_b.mp4'; clip(bf,s,CAP[tag])
    add(tc,f'{i:02d}. {ti}',f'{who}, {dt} ET, https://{link} | focus: {tag}'); add(bf)
# slow-mo + outro reuse
for p in [B+'/90_slow.mp4']+[B+f'/91_{j}.mp4' for j in range(7)]+[B+'/99_end.mp4']:
    add(p,{B+'/90_slow.mp4':'Slow-motion section (0.25x)',B+'/99_end.mp4':'Outro'}.get(p))
open(B+'/list4.txt','w').write(''.join(f"file '{p}'\n" for p in segs))
json.dump(chap,open(B+'/chap4.json','w')); print('total',T,'clips',N)
