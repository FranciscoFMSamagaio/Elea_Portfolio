#!/usr/bin/env bash
set -euo pipefail

pages=(
  index.html
  about.html
  cv.html
  contacts.html
  drawings.html
  3d-modeling.html
  architecture-model.html
  project-atelier.html
  project-urban.html
  project-heritage.html
)

mkdir -p pt en

for lang in pt en; do
  for page in "${pages[@]}"; do
    cp "$page" "$lang/$page"
  done

  perl -0pi -e '
    s#href="css/#href="../css/#g;
    s#src="js/#src="../js/#g;
    s#href="assets/#href="../assets/#g;
    s#src="assets/#src="../assets/#g;
    s#src="Drawing/#src="../Drawing/#g;
    s#src="3D_Modeling/#src="../3D_Modeling/#g;
    s#src="Architecture_Model/#src="../Architecture_Model/#g;
    s#href="3d-modeling.html"#href="3d-modeling.html"#g;
    s#href="architecture-model.html"#href="architecture-model.html"#g;
    s#href="drawings.html"#href="drawings.html"#g;
    s#location.href=\x27project-atelier.html\x27#location.href=\x27project-atelier.html\x27#g;
    s#location.href=\x27project-urban.html\x27#location.href=\x27project-urban.html\x27#g;
    s#location.href=\x27project-heritage.html\x27#location.href=\x27project-heritage.html\x27#g;
  ' "$lang"/*.html
done
