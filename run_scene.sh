#!/bin/bash

# מוודא שהזנת מספר סצנה
if [ -z "$1" ]; then
  echo "Error: Provide a scene number. Usage: ./run_scene.sh <scene_number>"
  exit 1
fi

SCENE=$1

echo "🎬 [1/4] DIRECTOR is drafting Scene $SCENE..."
claude "Draft Scene $SCENE in SCRIPT.md. Include Visual Direction and Narration. Run Kokoro to generate the audio. Make a git commit when done."

echo "🎨 [2/4] ANIMATOR is building initial Scene $SCENE..."
claude "Read SCRIPT.md for Scene $SCENE. Create src/Scene$SCENE.tsx, update Root.tsx, and integrate the audio. Render to render-0$SCENE.mp4. Make a git commit when done."

# לולאת אישור ושפצורים - לא נשברת עד שאתה מקליד 'y'
while true; do
    echo "👀 [3/4] READY FOR REVIEW. Find the latest render in your folder."
    
    echo "------------------------------------------------"
    echo "🤔 Scene $SCENE Review:"
    echo " - Type 'y' if it is perfect (will push to GitHub)."
    echo " - Type ANY OTHER TEXT to send feedback to the Animator (e.g., 'make the text larger')."
    read -p "Your input: " user_input

    if [[ "$user_input" == "y" || "$user_input" == "Y" ]]; then
        echo "🚀 [4/4] SUPERVISOR is reviewing and pushing..."
        claude "Review the latest commits for Scene $SCENE. If everything looks clean, run 'git push origin master'."
        echo "✅ Scene $SCENE successfully pushed! Moving on."
        break
    else
        echo "🔧 Fixing Scene $SCENE... Sending your feedback to the ANIMATOR."
        claude "The boss reviewed the last render for Scene $SCENE and gave this feedback: '$user_input'. Please fix the code in src/Scene$SCENE.tsx. REMEMBER THE LAB RULES: Never overwrite the previous render. Render the fixed video to a new incremental file name. Make a git commit when done."
        # אחרי שהאנימטור מסיים לתקן, הלולאה קופצת חזרה למעלה כדי שתבדוק שוב
    fi
done