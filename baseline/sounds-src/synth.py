"""Brim UI sounds — original, synthesized from scratch (numpy/scipy). 48 kHz stereo, normalized to about -18 LUFS."""
import numpy as np, scipy.signal as sg, pyloudnorm as pyln, wave, subprocess, json, os
SR=48000; rng=np.random.default_rng(7)
def t(d): return np.arange(int(SR*d))/SR
def env(d,a=.004,dec=.12,hold=0,curve=1.0):
    x=t(d); e=np.where(x<a,(x/a)**1.5,np.exp(-np.maximum(x-a-hold,0)/dec)); return e**curve
def bell(f,d,dec,amp=1,inh=(1,2.76,5.4,8.9),w=(1,.35,.12,.05)):
    x=t(d); return amp*sum(wi*np.sin(2*np.pi*f*h*x+rng.uniform(0,6))*np.exp(-x/(dec/(1+i*.8))) for i,(h,wi) in enumerate(zip(inh,w)))
def soft(f,d,a=.01,dec=.1,amp=1,det=1.5):
    x=t(d); s=np.sin(2*np.pi*f*x)+.5*np.sin(2*np.pi*(f+det)*x)+.15*np.sin(2*np.pi*2*f*x); return amp*s*env(d,a,dec)
def noise(d): return rng.standard_normal(int(SR*d))
def bp(x,lo,hi,o=2): return sg.sosfilt(sg.butter(o,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f,o=2): return sg.sosfilt(sg.butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sg.sosfilt(sg.butter(o,f,'high',fs=SR,output='sos'),x)
def sweep_noise(d,f0,f1,q=3):
    n=noise(d); out=np.zeros_like(n); seg=256
    for i in range(0,len(n),seg):
        f=f0*(f1/f0)**(i/len(n)); lo,hi=f/(1+1/q),f*(1+1/q); out[i:i+seg]=bp(n[max(0,i-2048):i+seg],lo,min(hi,SR/2-100))[-len(n[i:i+seg]):]
    return out
def at(x,ofs,total):
    y=np.zeros(int(SR*total)); i=int(SR*ofs); y[i:i+len(x)]+=x[:len(y)-i]; return y
IR=None
def reverb(x,mix=.18,dur=.9):
    global IR
    if IR is None:
        L=int(SR*dur); d=np.exp(-t(dur)/(dur/6.5))
        IR=[lp(hp(noise(dur)*d,250),7000) for _ in range(2)]; IR=[i/np.sqrt((i**2).sum()) for i in IR]
    x=np.concatenate([x,np.zeros(int(SR*dur))])
    wet=[sg.fftconvolve(x,i)[:len(x)] for i in IR]
    return np.stack([x*(1-mix)+w*mix*2.2 for w in wet],1)
def finish(name,x,mix=.18,lufs=-18.0,trim=True):
    y=reverb(x,mix); y=y/np.abs(y).max()*.5
    # fade tail to silence
    e=np.abs(y).max(1); idx=np.where(e>1e-4)[0]; y=y[:idx[-1]+1] if trim else y
    f=int(SR*.03); y[-f:]*=np.linspace(1,0,f)[:,None]
    meas=np.concatenate([y,np.zeros((SR,2))]); m=pyln.Meter(SR,block_size=.1); L=m.integrated_loudness(meas)
    y=y*10**((lufs-L)/20); pk=np.abs(y).max()
    if pk>.89: y*=.89/pk  # true-peak headroom ~-1 dBFS
    L2=m.integrated_loudness(np.concatenate([y,np.zeros((SR,2))]))
    w=wave.open(f'../src/renderer/sounds/{name}.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32767).astype('<i2').tobytes()); w.close()
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'../src/renderer/sounds/{name}.wav','-c:a','libvorbis','-q:a','4',f'../src/renderer/sounds/{name}.ogg'],check=True)
    return dict(name=name,ms=round(len(y)/SR*1000),lufs=round(L2,1),peak_db=round(20*np.log10(np.abs(y).max()),1))
S={}
# wake: warm two-note ember bell (E5 -> B5) with airy shimmer
d=.9; x=at(bell(659.3,.6,.35,.9),0,d)+at(bell(987.8,.7,.4,1),.075,d)+at(hp(noise(.5),6000)*env(.5,.08,.12)*.05,0,d)
S['wake']=finish('wake',x,.25)
# listen-on: soft rising glide 440->660 sine with breath
d=.32; f=np.linspace(440,660,int(SR*.22)); ph=2*np.pi*np.cumsum(f)/SR; g=np.sin(ph)*env(.22,.012,.07); x=at(g,0,d)+at(bp(noise(.2),1500,4000)*env(.2,.02,.05)*.08,0,d)
S['listen-on']=finish('listen-on',x,.15)
d=.32; f=np.linspace(660,420,int(SR*.22)); ph=2*np.pi*np.cumsum(f)/SR; g=np.sin(ph)*env(.22,.008,.06); x=at(g,0,d)
S['listen-off']=finish('listen-off',x,.15)
# thinking tick: tiny woody click (filtered noise + 1.9k body)
x=at(bp(noise(.05),1200,5000,4)*env(.05,.0008,.008),0,.07)+at(soft(1900,.06,.001,.012,.6),0,.07)
S['tick']=finish('tick',x,.08,lufs=-24)
# appear: airy whoosh (rising bandpass noise) + soft low body
d=.45; x=sweep_noise(.38,500,3800,2.5)*env(.38,.16,.08)*1.0; x=at(x,0,d)+at(soft(220,.3,.12,.08,.35),.08,d)
S['appear']=finish('appear',x,.2)
# reshape: short flutter (two quick filtered blips) + tiny glide
d=.3; x=at(bp(noise(.06),2000,6000)*env(.06,.004,.015),0,d)+at(bp(noise(.06),2600,7000)*env(.06,.004,.015)*.8,.055,d)+at(soft(880,.15,.005,.05,.4),.02,d)
S['reshape']=finish('reshape',x,.15,lufs=-21)
# ready: clean glass ping C6 with fifth
d=.5; x=at(bell(1046.5,.45,.22,1),0,d)+at(bell(1568,.4,.18,.4),.0,d)
S['ready']=finish('ready',x,.2,lufs=-20)
# needs-you: two gentle mallet notes G5-G5 rising slightly in brightness
d=.6; x=at(bell(783.99,.3,.12,1,w=(1,.2,.05,.02)),0,d)+at(bell(783.99,.35,.16,1,w=(1,.4,.12,.05)),.13,d)
S['needs-you']=finish('needs-you',x,.2)
# approve: confident major third up D5->F#5 soft
d=.5; x=at(soft(587.3,.2,.004,.07),0,d)+at(soft(740,.3,.004,.1),.07,d)+at(bell(1480,.3,.12,.25),.07,d)
S['approve']=finish('approve',x,.2)
# sent: swoosh away (falling-to-rising noise) + bright confirm chime A5-E6
d=.75; x=at(sweep_noise(.3,1200,6000,3)*env(.3,.05,.06)*.8,0,d)+at(bell(880,.4,.2,.8),.2,d)+at(bell(1318.5,.45,.25,.9),.29,d)
S['sent']=finish('sent',x,.25)
# dismiss: soft downward puff
d=.35; x=sweep_noise(.28,3500,600,2.5)*env(.28,.01,.07)
S['dismiss']=finish('dismiss',at(x,0,d),.15,lufs=-22)
# error: muted minor second, low, short
d=.5; x=at(soft(311.1,.25,.006,.09),0,d)+at(soft(293.7,.3,.006,.11),.11,d)+at(lp(noise(.1),900)*env(.1,.002,.02)*.3,0,d)
S['error']=finish('error',x,.15)
# undo: reverse-ish rewind blip
d=.35; f=np.linspace(900,500,int(SR*.16)); g=np.sin(2*np.pi*np.cumsum(f)/SR)*env(.16,.03,.05)[::-1]**.6*env(.16,.002,.08)
S['undo']=finish('undo',at(g,0,d),.15)
json.dump(S,open('../src/renderer/sounds/manifest.json','w'),indent=1)
for v in S.values(): print(v)
