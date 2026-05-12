import os

RENDER_URL = "https://postharvest-backend.onrender.com"
LOCAL_URL = "http://localhost:5000"

# Write api.js
api_config = f'const API_BASE_URL = process.env.REACT_APP_API_URL || "{RENDER_URL}";\n\nexport default API_BASE_URL;\n'
with open("frontend/src/config/api.js", "w", encoding="utf-8") as f:
    f.write(api_config)
print("Written: frontend/src/config/api.js")

# Files to patch
files_to_patch = [
    "frontend/src/FarmerDashboard.js",
    "frontend/src/FarmerLogin.js",
    "frontend/src/FarmerRegister.js",
    "frontend/src/PolicymakerDashboard.js",
]

imports_to_add = {
    "frontend/src/FarmerDashboard.js": (
        'const API = "http://localhost:5000";',
        'import API_BASE_URL from "./config/api";\n\nconst API = API_BASE_URL;'
    ),
    "frontend/src/FarmerLogin.js": (
        'import { FaSeedling, FaMobileAlt, FaLock, FaArrowLeft } from "react-icons/fa";',
        'import { FaSeedling, FaMobileAlt, FaLock, FaArrowLeft } from "react-icons/fa";\nimport API_BASE_URL from "./config/api";'
    ),
    "frontend/src/FarmerRegister.js": (
        'import WorkingLeafletMap from "./components/WorkingLeafletMap";',
        'import WorkingLeafletMap from "./components/WorkingLeafletMap";\nimport API_BASE_URL from "./config/api";'
    ),
    "frontend/src/PolicymakerDashboard.js": (
        'import "chart.js/auto";',
        'import "chart.js/auto";\nimport API_BASE_URL from "./config/api";'
    ),
}

for filepath in files_to_patch:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Add import if needed
    if filepath in imports_to_add:
        old, new = imports_to_add[filepath]
        if old in content and "API_BASE_URL" not in content:
            content = content.replace(old, new)

    # Replace localhost URLs
    content = content.replace(f'"{LOCAL_URL}', f'`${{API_BASE_URL}}')
    content = content.replace(f'"{LOCAL_URL}/', f'`${{API_BASE_URL}}/')
    content = content.replace(LOCAL_URL, "${API_BASE_URL}")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Patched: {filepath}")

print("\nAll done!")
