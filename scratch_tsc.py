import subprocess
import os

try:
    # Run npx tsc or eslint on VoiceInterface.jsx
    result = subprocess.run(
        ["npx.cmd", "tsc", "--noEmit", "--jsx", "react", "frontend/src/components/VoiceInterface.jsx"], 
        cwd="c:\\Users\\LENOVO\\Desktop\\EchoAI",
        capture_output=True,
        text=True
    )
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
except Exception as e:
    print("Error:", str(e))
