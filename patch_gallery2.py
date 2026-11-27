p = 'src/components/home/CampaignGallery.tsx'
s = open(p).read()

dup = '''        {/* Movement 3 — detail strip */}
        <Reveal delay={60}>
          <p className={styles.movementLabel}>{isAr ? "القطع" : "THE PIECES"}</p>
        </Reveal>
        <div className={styles.duet}>
          {PIECE_SHOTS.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 100} className={styles.duetItem}>
              <Frame shot={shot} isAr={isAr} sizes="(min-width: 64rem) 48vw, 100vw" />
            </Reveal>
          ))}
        </div>

'''
assert dup in s
s = s.replace(dup, '')

# BACK_SHOTS is no longer used (her back moved into the opener, his back into the pieces)
start = s.index('const BACK_SHOTS: Shot[] = [')
end = s.index('const DETAIL_SHOTS: Shot[] = [')
s = s[:start] + s[end:]

open(p, 'w').write(s)
print('ok')
