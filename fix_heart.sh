# Reemplazar el bloque SVG del corazón completo
sed -i '' '/<svg viewBox="0 0 320 320" class="heart-svg"/,/<\/svg>/c\
        <svg viewBox="0 0 320 320" class="heart-svg" id="heartSvg">\
          <!-- SA Node -->\
          <circle class="sa-node sa-node-pulse" cx="90" cy="160" r="10" style="transform-origin:90px 160px"/>\
          <!-- SA to AV paths -->\
          <path class="path-line path-sa-av" d="M 90,160 L 150,200" stroke-width="3" stroke-dasharray="80" stroke-dashoffset="80"/>\
          <path class="path-line path-sa-av" d="M 90,160 Q 80,200 150,200" stroke-width="3" stroke-dasharray="90" stroke-dashoffset="90"/>\
          <path class="path-line path-sa-av" d="M 90,160 Q 52,220 150,200" stroke-width="3" stroke-dasharray="100" stroke-dashoffset="100"/>\
          <path class="path-line path-sa-av" d="M 90,160 Q 152,140 150,200" stroke-width="3" stroke-dasharray="90" stroke-dashoffset="90"/>\
          <!-- SA to Junction -->\
          <path class="path-linepath-sa-av" d="M 90,160 Q 123,130 160,140" stroke-width="3" stroke-dasharray="80" stroke-dashoffset="80"/>\
          <!-- AV Node -->\
          <circle class="av-node" cx="150" cy="200" r="8" style="transform-origin:150px 200px"/>\
          <!-- Bundle of His -->\
          <path class="path-line path-his" d="M 150,200 Q 185,241 200,270" stroke-width="5" stroke-dasharray="100" stroke-dashoffset="100"/>\
          <!-- Left branch -->\
          <path class="path-line path-div1" d="M 200,270 C 180,272 136,266 110,240" stroke-width="4" stroke-dasharray="110" stroke-dashoffset="110"/>\
          <!-- Right branch -->\
          <path class="path-line path-div2" d="M 200,270 C 214,264 218,220 206,180" stroke-width="4" stroke-dasharray="110" stroke-dashoffset="110"/>\
          <!-- Purkinje left -->\
          <path class="path-line path-purk" d="M 114,244 Q 122,232 132,226" stroke-width="2.5" stroke-dasharray="40" stroke-dashoffset="40"/>\
          <path class="path-line path-purk" d="M 140,262 Q 148,248 156,234" stroke-width="2.5" stroke-dasharray="40" stroke-dashoffset="40"/>\
          <path class="path-line path-purk" d="M 181,270 Q 176,256 172,240" stroke-width="2.5" stroke-dasharray="40" stroke-dashoffset="40"/>\
          <!-- Purkinje right -->\
          <path class="path-line path-purk" d="M 208,186 Q 192,189 180,196" stroke-width="2.5" stroke-dasharray="40" stroke-dashoffset="40"/>\
          <path class="path-line path-purk" d="M 213,210 Q 200,209 186,208" stroke-width="2.5" stroke-dasharray="40" stroke-dashoffset="40"/>\
          <path class="path-line path-purk" d="M 210,256 Q 206,238 200,230" stroke-width="2.5" stroke-dasharray="40" stroke-dashoffset="40"/>\
          <!-- Terminal dots -->\
          <circle class="dot dot-early" cx="110" cy="240" r="3.5"/>\
          <circle class="dot dot-early" cx="206" cy="180" r="3.5"/>\
          <circle class="dot dot-late" cx="132" cy="226" r="3"/>\
          <circle class="dot dot-late" cx="156" cy="234" r="3"/>\
          <circle class="dot dot-late" cx="172" cy="240" r="3"/>\
          <circle class="dot dot-late" cx="180" cy="196" r="3"/>\
          <circle class="dot dot-late" cx="186" cy="208" r="3"/>\
          <circle class="dot dot-late" cx="200" cy="230" r="3"/>\
        </svg>' index.html
