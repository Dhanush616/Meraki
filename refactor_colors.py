import os
import glob
import re

def update_colors(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Dictionary of replacements
    replacements = {
        r'\bbg-parchment\b': 'bg-background',
        r'\bbg-ivory\b': 'bg-card',
        r'\bborder-border-cream\b': 'border-border',
        r'\btext-near-black\b': 'text-foreground',
        r'\btext-olive-gray\b': 'text-muted-foreground',
        r'\bbg-brand\b': 'bg-primary',
        r'\btext-brand\b': 'text-primary',
        r'\btext-ivory\b': 'text-primary-foreground',
        r'\bbg-brand/20\b': 'bg-primary/20',
        r'\bbg-brand/10\b': 'bg-primary/10',
        r'\btext-brand\b': 'text-primary',
        r'\bdecoration-brand/30\b': 'decoration-primary/30',
        r'\bring-brand/20\b': 'ring-ring/20',
        r'\bborder-brand/40\b': 'border-ring/40',
        r'\bborder-brand\b': 'border-primary',
        r'\bhover:bg-\[#b05637\]\b': 'hover:bg-primary/90',
        r'\bhover:bg-[#262626]\b': 'hover:bg-primary/90',
        r'\btext-warm-sand\b': 'text-muted-foreground',
        r'\bshadow-\[0_8px_30px_rgb\(0,0,0,0\.04\)\]\b': 'shadow-lg',
        r'\bshadow-\[0_4px_24px_rgba\(0,0,0,0\.02\)\]\b': 'shadow-md',
        r'\bfont-serif\b': 'font-sans', # Just standardizing to the globals.css family
    }

    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

target_pattern = 'c:/Users/tharu/OneDrive/Documents/GitHub/Meraki/frontend/**/*.tsx'
files = glob.glob(target_pattern, recursive=True)

for file in files:
    update_colors(file)

print("Done Refactoring colors!")
