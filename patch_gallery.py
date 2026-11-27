import re

p = 'src/components/home/CampaignGallery.tsx'
s = open(p).read()

# --- shots -------------------------------------------------------------
s = s.replace('''const BACK_SHOTS: Shot[] = [''', '''const OPENER_BACK: Shot = {
  src: "/images/campaign/2026/studio-girl-blue-back.jpg",
  altEn: "Slate blue hoodie from the back, cream backdrop",
  altAr: "الهودي الأزرق من ورا على خلفية كريمي",
};

const BACK_SHOTS: Shot[] = [''')

s = s.replace('''const PIECE_SHOTS: Shot[] = [
  {
    src: "/images/campaign/2026/desertx-black-dark.jpg",
    altEn: "Desert X in black with grey embroidery on a dark backdrop",
    altAr: "Desert X أسود بتطريز رمادي على خلفية غامقة",
  },
  {
    src: "/images/campaign/2026/desertx-brown-cream.jpg",
    altEn: "Desert X in earth brown with camel embroidery on a cream backdrop",
    altAr: "Desert X بني ترابي بتطريز الجمل على خلفية كريمي",
  },
];''', '''const PIECE_SHOTS: Shot[] = [
  {
    src: "/images/campaign/2026/studio-boy-black-back.jpg",
    altEn: "Black Journey hoodie from the back, camel embroidery, tan backdrop",
    altAr: "هودي الرحلة الأسود من ورا، تطريز الجمل، على خلفية بيج",
  },
  {
    src: "/images/campaign/2026/desertx-brown-cream.jpg",
    altEn: "Desert X in earth brown with camel embroidery on a cream backdrop",
    altAr: "Desert X بني ترابي بتطريز الجمل على خلفية كريمي",
  },
  {
    src: "/images/campaign/2026/journey-black-gold-tan.jpg",
    altEn: "Black Journey hoodie with gold sun embroidery on a tan backdrop",
    altAr: "هودي الرحلة الأسود بتطريز الشمس الدهبي على خلفية بيج",
  },
];''')

# the square is now the Desert X black frame
s = s.replace('''const OPENER_SECOND: Shot = {
  src: "/images/campaign/2026/journey-black-gold-tan.jpg",
  altEn: "Black Journey hoodie with gold sun embroidery on a tan backdrop",
  altAr: "هودي الرحلة الأسود بتطريز الشمس الدهبي على خلفية بيج",
};''', '''const OPENER_SECOND: Shot = {
  src: "/images/campaign/2026/desertx-black-dark.jpg",
  altEn: "Desert X in black with grey embroidery on a dark backdrop",
  altAr: "Desert X أسود بتطريز رمادي على خلفية غامقة",
};''')

# --- opener markup -----------------------------------------------------
old_opener_start = s.index('        {/* Movement 1')
old_opener_end = s.index('        {/* Movement 2')
new_opener = '''        {/* Movement 1 — opener. DOM order is the mobile reading order:
            her front, her back, then the Desert X square and the panel. On
            desktop the grid places them as two columns with the same pairs. */}
        <div className={styles.opener}>
          <Reveal className={styles.openerMain}>
            <Frame shot={OPENER_MAIN} isAr={isAr} sizes="(min-width: 64rem) 56vw, 100vw" />
          </Reveal>

          <Reveal delay={80} className={styles.openerBack}>
            <Frame shot={OPENER_BACK} isAr={isAr} sizes="(min-width: 64rem) 56vw, 100vw" />
          </Reveal>

          <Reveal delay={140} className={styles.openerSecond}>
            <Frame shot={OPENER_SECOND} isAr={isAr} sizes="(min-width: 64rem) 40vw, 100vw" />
          </Reveal>

          <Reveal delay={200} className={styles.openerPanel}>
            <div className={styles.panel}>
              <span className={styles.panelIndex} dir="ltr">01 — 10</span>
              <span className={styles.panelRule} aria-hidden="true" />
              <span className={styles.panelLabel}>
                {isAr ? "دروب ٠١ — جورني" : "DROP 01 — THE JOURNEY"}
              </span>
              <span className={styles.panelMeta}>{isAr ? "القاهرة — مصر" : "CAIRO — EGYPT"}</span>
            </div>
          </Reveal>
        </div>

'''
s = s[:old_opener_start] + new_opener + s[old_opener_end:]

# --- movement 2 becomes the three remaining pieces ---------------------
old_m2_start = s.index('        {/* Movement 2')
old_m3_start = s.index('        {/* Movement 3')
new_m2 = '''        {/* Movement 2 — the remaining pieces */}
        <Reveal delay={60}>
          <p className={styles.movementLabel}>{isAr ? "القطع" : "THE PIECES"}</p>
        </Reveal>
        <div className={styles.pieces}>
          {PIECE_SHOTS.map((shot, i) => (
            <Reveal key={shot.src} delay={i * 90} className={styles.piecesItem}>
              <Frame shot={shot} isAr={isAr} sizes="(min-width: 64rem) 32vw, 100vw" />
            </Reveal>
          ))}
        </div>

'''
s = s[:old_m2_start] + new_m2 + s[old_m3_start:]

# movement 3 block is gone already; drop the old "Movement 3 — the two Desert X pieces" block if present
s = s.replace('''        {/* Movement 3 — the two Desert X pieces */}''', '''        {/* Movement 3 — detail strip */}''')
s = s.replace('''        {/* Movement 4 — detail strip */}''', '''        {/* Movement 3 — detail strip */}''')

open(p, 'w').write(s)
print(s[s.index('        {/* Movement 1'):s.index('      </Container>')])
