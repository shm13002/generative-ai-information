import subprocess, os, json
G='/workspace/genui'; N=G+'/analysis-video/new'; B=G+'/analysis-video/build'
F='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
A='ahmadafterhours'; O='omarships'
# path, author, id, ET date, title, tag
C=[
(N+'/2101084369012097282.mp4',A,'2101084369012097282','Sep 18, 2026','Canvas on a busy afternoon','canvas'),
(N+'/2101364312908451978.mp4',A,'2101364312908451978','Sep 19, 2026','"I think I just killed Siri..."','voice'),
(G+'/u-sep24-bugqueue/video.mp4',A,'2102939972160344558','Sep 23, 2026','Six agents work the bug queue','canvas'),
(G+'/u-sep25-remind/video.mp4',A,'2103295497750323338','Sep 24, 2026','Killing "remind me later"','approval'),
(G+'/u-sep25-widgets/video.mp4',A,'2103484917040787493','Sep 25, 2026','We made widgets cool again','canvas'),
(N+'/2103678536062284276.mp4',O,'2103678536062284276','Sep 25, 2026','Dashboards are dead (live widgets)','canvas'),
(G+'/u-sep26-inbox/video.mp4',A,'2103853360587714956','Sep 26, 2026','Killing the 7am inbox scroll','approval'),
(G+'/u-sep26-motiononeshot/video.mp4',A,'2103969946778656802','Sep 26, 2026','Motion graphics one-shot (Opus + Agently)','motion'),
(N+'/2104077185187254472.mp4',O,'2104077185187254472','Sep 27, 2026','Flood of motion graphics','motion'),
(G+'/u-sep27-brief/video.mp4',A,'2104327803697049769','Sep 27, 2026','AI chief of staff 9am brief','canvas'),
(N+'/2104343385301487929.mp4',O,'2104343385301487929','Sep 27, 2026','Sees your screen, works your Mac','voice'),
(G+'/u-sep28-killedsiri/video.mp4',A,'2104649060980605289','Sep 28, 2026','We just killed Siri with this','voice'),
(N+'/2104802404805775518.mp4',O,'2104802404805775518','Sep 29, 2026','Stealth mode (meetings)','voice'),
(G+'/u-sep29-buriedsiri/video.mp4',A,'2104919563766751723','Sep 29, 2026','Today we buried Siri','voice'),
(N+'/2105099318101508547.mp4',O,'2105099318101508547','Sep 29, 2026','Backlog gone before baggage claim','approval'),
(G+'/u-sep30-outreach/video.mp4',A,'2105291791826329716','Sep 30, 2026','Solved outreach with Jarvis','genui'),
(N+'/2105496150698516506.mp4',O,'2105496150698516506','Sep 30, 2026','RIP SaaS (cancel tools, fingerprint)','approval'),
(G+'/u-oct01-seescreen/video.mp4',A,'2105681163767742623','Oct 1, 2026','Jarvis sees my screen','voice'),
(N+'/2105846363598823878.mp4',O,'2105846363598823878','Oct 1, 2026','A hundred tasks at once (v1)','genui'),
(G+'/u-oct02-dating/video.mp4',A,'2106040660759306707','Oct 2, 2026','Jarvis runs your dating life','voice'),
(N+'/2106213279085568440.mp4',O,'2106213279085568440','Oct 2, 2026','Learns by watching you','genui'),
(G+'/u-oct03-slack/video.mp4',A,'2106410619385561302','Oct 3, 2026','Whole morning from one Slack message','canvas'),
(G+'/u-oct04-50years/video.mp4',A,'2106847153419178058','Oct 4, 2026','50 years of interfaces','genui'),
(N+'/2106877791342141659.mp4',O,'2106877791342141659','Oct 4, 2026','Apps are dead','genui'),
(N+'/2107245849344421931.mp4',O,'2107245849344421931','Oct 5, 2026','The agent Apple couldn\'t build','genui'),
(G+'/u-oct06-interfaces/video.mp4',A,'2107266910421189117','Oct 5, 2026','We recreated interfaces','genui'),
(G+'/o-oct07-reinvented/video.mp4',A,'2107996181150281948','Oct 7, 2026','Reinvented how you run your company','approval'),
(G+'/o-oct08-interrupt/video.mp4',O,'2108016505786929244','Oct 7, 2026','Your AI should interrupt you','voice'),
(G+'/v0-oct08-company/video.mp4',None,None,'Oct 8, 2026','Company video (saved earlier; post link not recorded)','genui'),
(G+'/v1-oct08-genui/video.mp4',A,'2108325993979277417','Oct 8, 2026','Introducing generative UI (115K views)','genui'),
(G+'/o-oct08-designsitself/video.mp4',O,'2108345903127937530','Oct 8, 2026','UI that designs itself','genui'),
(G+'/o-oct09-indexed/video.mp4',O,'2108688114223116490','Oct 9, 2026','We indexed your company','canvas'),
(G+'/v2-oct10-recreated/video.mp4',A,'2109011110091235479','Oct 10, 2026','Recreated how you use a computer','genui'),
(G+'/v3-oct11-agentos/video.mp4',A,'2109412082231955786','Oct 11, 2026','OS for the agentic era','genui'),
(G+'/o-oct12-palantir/video.mp4',O,'2109448253385084999','Oct 11, 2026','Ontology of your company','canvas'),
(G+'/video.mp4',A,'2109780562210603457','Oct 12, 2026','Generative UI (v2 cut)','genui'),
(G+'/o-oct13-watches/video.mp4',O,'2109818303136813382','Oct 12, 2026','You\'ll never prompt again','genui'),
(G+'/v5-oct13-notch/video.mp4',A,'2110152973741654405','Oct 13, 2026','MacBook notch','notch'),
(G+'/o-oct13-100tasks/video.mp4',O,'2110155655399006303','Oct 13, 2026','A hundred tasks at once (v2)','genui'),
]
CAP={
'genui':[(.08,'Instant skeleton card: keyword rules pick the card shape before any AI call'),(.22,'Blocks stream in one by one (13 fixed block types, max 12 per card)'),(.34,'Arrival spring: ~700 ms, stiffness 120 / damping 17'),(.46,'Text phrases appear ~150 ms apart'),(.58,'Numbers count up over ~750 ms; list rows draw in ~110 ms each'),(.70,'Reshape spring: ~560 ms (210 / 26) as the card changes layout'),(.82,'Status chips: working > ready > needs-you > error'),(.92,'Approval card: nothing sends until you say yes')],
'canvas':[(.1,'Canvas of cards ranked by what needs you'),(.3,'Rows draw in ~110 ms each, staggered'),(.5,'Numbers count up over ~750 ms'),(.7,'Status chips show working / ready / needs-you'),(.88,'Cards re-sort with the ~560 ms reshape spring')],
'voice':[(.08,'Wake word ("Jarvis") detected by a native Swift helper'),(.25,'Live voice: OpenAI realtime speech, captions follow the words'),(.45,'Skeleton card appears instantly while the agent works'),(.65,'Native helper drives other Mac apps (computer use)'),(.85,'Results land as cards; status chip flips to ready')],
'approval':[(.1,'Agent finds work waiting on you across connected tools'),(.3,'Draft lands in an approval card'),(.5,'Blocks stream in; text phrases ~150 ms apart'),(.7,'Status chip: needs-you'),(.88,'Approve > card collapses with the reshape spring')],
'motion':[(.15,'Pure motion graphics made with Opus + Agently, not a product screen'),(.6,'Shows the same spring easing language used in the UI')],
'notch':[(.08,'Notch idle: ~400 px wide bar, small corner radius (~12 px)'),(.25,'Notch opens to ~440 px; radii grow to ~20-24 px'),(.42,'"What needs you" chip appears in the notch'),(.6,'Card is built below the notch: skeleton > blocks stream in'),(.78,'Arrival spring ~700 ms; reshape ~560 ms'),(.92,'Notch collapses back to the bar when done')],
}
def esc(s): return s.replace('\\','\\\\').replace(':','\\:').replace("'","\u2019").replace('%','\\%')
def dur(p): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p]))
def hasaud(p): return bool(subprocess.check_output(['ffprobe','-v','error','-select_streams','a','-show_entries','stream=index','-of','csv=p=0',p]).strip())
ENC=['-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','160k','-ar','48000','-ac','2']
def run(a): subprocess.run(['ffmpeg','-y','-v','error']+a,check=True)
def card(out,lines,d=3.0):
    vf=[]; y=380
    for i,(t,sz,c) in enumerate(lines):
        vf.append(f"drawtext=fontfile={FB if i==0 else F}:text='{esc(t)}':fontsize={sz}:fontcolor={c}:x=(w-tw)/2:y={y}"); y+=sz+40
    run(['-f','lavfi','-i',f'color=c=0x0b0d12:s=1920x1080:d={d}:r=30','-f','lavfi','-i',f'anullsrc=r=48000:cl=stereo','-t',str(d),'-vf',','.join(vf)+f",fade=in:0:10,fade=out:st={d-0.4}:d=0.4"]+ENC+[out])
def clip(out,src,caps,ss=0,t=None,speed=1.0,label=None):
    d=t or dur(src); vf=[f'setpts=PTS/{speed}' if speed!=1 else 'null','scale=1920:1080:force_original_aspect_ratio=decrease','pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x0b0d12','fps=30']
    D=d/speed
    vf.append(f"drawtext=fontfile={F}:text='MOTION-DESIGN PROMO (not a live screen recording)':fontsize=22:fontcolor=white@0.6:x=30:y=24")
    if label: vf.append(f"drawtext=fontfile={FB}:text='{esc(label)}':fontsize=34:fontcolor=yellow:x=30:y=60")
    for k,(fr,tx) in enumerate(caps):
        a=fr*D; b=min(D, (caps[k+1][0]*D) if k+1<len(caps) else D)
        b=min(b,a+4.5)
        vf.append(f"drawtext=fontfile={FB}:text='{esc(tx)}':fontsize=38:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=18:x=(w-tw)/2:y=h-120:enable='between(t,{a:.2f},{b:.2f})'")
    inp=['-ss',str(ss),'-t',str(d),'-i',src]
    if hasaud(src):
        af='atempo=0.5,atempo=0.5' if speed==0.25 else 'anull'
        maps=['-af',af]
    else:
        inp+=['-f','lavfi','-t',str(D),'-i','anullsrc=r=48000:cl=stereo']; maps=['-map','0:v','-map','1:a']
    run(inp+['-vf',','.join(vf)]+maps+ENC+['-shortest',out])
segs=[]; chap=[]; T=0.0
def add(p,title,note):
    global T; chap.append((T,title,note)); segs.append(p); T+=dur(p)
os.makedirs(B,exist_ok=True)
p=B+'/00_intro.mp4'; card(p,[('Agently "Jarvis" Generative UI - Analysis Compilation',58,'white'),(f'{len(C)} promo/demo videos from X (Sep 18 - Oct 13, 2026) + 0.25x slow-motion replays',34,'0xbfc6d4'),('Note: these are motion-design promos, not live screen recordings. Timings are from Agently app code.',30,'yellow')],6)
add(p,'Intro','Scope and caveat')
for i,(src,au,pid,dt,ti,tag) in enumerate(C,1):
    link=f'x.com/{au}/status/{pid}' if pid else 'link not recorded'
    who={'ahmadafterhours':'Ahmad Hajj (@ahmadafterhours, co-founder)','omarships':'Omar Ghandour (@omarships, co-founder)'}.get(au,'Agently')
    tc=B+f'/{i:02d}a.mp4'; card(tc,[(f'{i:02d}. {ti}',56,'white'),(f'{who}  -  {dt} ET',34,'0xbfc6d4'),(link,30,'0x7fb2ff'),(f'Focus: {tag}',28,'0x9aa3b2')])
    cp=B+f'/{i:02d}b.mp4'; clip(cp,src,CAP[tag])
    add(tc,f'{i:02d}. {ti}',f'{who}, {dt} ET, https://{link} | focus: {tag} | captions: '+'; '.join(c for _,c in CAP[tag])); segs.append(cp); T+=dur(cp)
p=B+'/90_slow.mp4'; card(p,[('Slow-motion replay (0.25x)',58,'white'),('Key UI-population moments: skeleton > blocks > springs > count-up > rows',34,'0xbfc6d4')],4)
add(p,'Slow-motion section (0.25x)','Audio slowed with atempo to match')
SL=[(G+'/v1-oct08-genui/video.mp4',3,5,'Gen UI (Oct 8): skeleton + blocks streaming'),(G+'/v1-oct08-genui/video.mp4',14,5,'Gen UI (Oct 8): reshape spring'),(G+'/v2-oct10-recreated/video.mp4',6,5,'Recreated (Oct 10): rows draw in + count-up'),(G+'/v3-oct11-agentos/video.mp4',8,5,'Agent OS (Oct 11): card arrival spring'),(G+'/v5-oct13-notch/video.mp4',2,5,'Notch (Oct 13): open 400 > 440 px'),(G+'/v5-oct13-notch/video.mp4',20,5,'Notch (Oct 13): card build + collapse'),(G+'/video.mp4',5,5,'Gen UI v2 (Oct 12): phrases ~150 ms apart')]
for j,(s,ss,t,l) in enumerate(SL):
    p=B+f'/91_{j}.mp4'; clip(p,s,[(0.02,'0.25x: watch each block land with overshoot then settle'),(0.5,'At 0.25x a 700 ms spring lasts ~2.8 s; a 110 ms row stagger ~0.44 s')],ss=ss,t=t,speed=0.25,label='0.25x  '+l)
    add(p,'Slow-mo: '+l,f'source {s.split("/genui/")[1]} from {ss}s, {t}s at 0.25x')
p=B+'/99_end.mp4'; card(p,[('How it works (summary)',56,'white'),('Keyword skeleton > Claude fills 13 fixed block types > streamed + springs',34,'0xbfc6d4'),('Promos are motion design; app timings verified from Agently code',30,'yellow')],5)
add(p,'Outro','Summary')
open(B+'/list.txt','w').write(''.join(f"file '{s}'\n" for s in segs))
json.dump(chap,open(B+'/chap.json','w'))
print('total',T)
