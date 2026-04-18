import os

def fix_async_def():
    routers_dir = r"c:\Meraki\backend\routers"
    for root, _, files in os.walk(routers_dir):
        for file in files:
            if file.endswith(".py"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                # A safe way to remove async keyword from endpoint defs when they don't contain await.
                # Since routers have decorator lines, splitting directly by "async def " and looking for "await" 
                # in the next chunk is simplistic but effective because endpoint bounds are mostly separated by blank lines and decorators.
                
                parts = content.split("async def ")
                if len(parts) == 1:
                    continue # No async defs

                new_parts = [parts[0]]
                for part in parts[1:]:
                    if "await " not in part and "yield " not in part:
                        print(f"[{file}] Transforming: {part.split('(')[0]}")
                        new_parts.append("def " + part)
                    else:
                        new_parts.append("async def " + part)

                new_content = "".join(new_parts)

                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Fixed {file}")

if __name__ == '__main__':
    fix_async_def()