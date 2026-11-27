p = 'src/components/home/campaign-gallery.module.css'
s = open(p).read()

s = s.replace('''.openerSide {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

''', '')

s = s.replace('''.openerMain .frame {
  aspect-ratio: 4 / 5;
}

.openerSecond .frame {
  aspect-ratio: 1 / 1;
}''', '''.openerMain .frame,
.openerBack .frame {
  aspect-ratio: 4 / 5;
}

.openerSecond .frame {
  aspect-ratio: 1 / 1;
}

.openerPanel .panel {
  height: 100%;
}''')

s = s.replace('''.duet {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}

.duetItem .frame {
  aspect-ratio: 3 / 4;
}''', '''.pieces {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}

.piecesItem .frame {
  aspect-ratio: 3 / 4;
}''')

s = s.replace('''@media (min-width: 48rem) {
  .opener {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: 1rem;
  }

  .openerSide {
    gap: 1rem;
  }

  /* The small square grows to meet the panel, so no white gap can open up. */
  .openerSecond {
    flex: 1 1 auto;
    min-height: 0;
  }

  .openerSecond .frame {
    aspect-ratio: auto;
    height: 100%;
  }

  .duet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }''', '''@media (min-width: 48rem) {
  /* Her front and back stack in the wide column; the Desert X square and the
     black panel stack in the narrow one. Same pairs as the mobile order. */
  .opener {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    grid-template-areas:
      "front square"
      "back panel";
    gap: 1rem;
  }

  .openerMain {
    grid-area: front;
  }

  .openerBack {
    grid-area: back;
  }

  .openerSecond {
    grid-area: square;
  }

  .openerPanel {
    grid-area: panel;
  }

  /* The square grows to meet the panel, so no white gap can open up. */
  .openerSecond .frame {
    aspect-ratio: auto;
    height: 100%;
  }

  .pieces {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }''')

open(p, 'w').write(s)
print('ok')
