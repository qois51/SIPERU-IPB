import os
import re

def strip_python_comments(source):
    lines = source.splitlines()
    cleaned = []
    for line in lines:
        if not line.strip():
            cleaned.append(line)
            continue
            
        in_single_quote = False
        in_double_quote = False
        in_triple_single = False
        in_triple_double = False
        comment_index = -1
        
        i = 0
        n = len(line)
        while i < n:
            if i + 2 < n and line[i:i+3] == '"""' and not in_single_quote and not in_triple_single:
                in_triple_double = not in_triple_double
                i += 3
                continue
            if i + 2 < n and line[i:i+3] == "'''" and not in_double_quote and not in_triple_double:
                in_triple_single = not in_triple_single
                i += 3
                continue
                
            char = line[i]
            if char == '\\':
                i += 2
                continue
            elif char == '"' and not in_single_quote and not in_triple_single and not in_triple_double:
                in_double_quote = not in_double_quote
            elif char == "'" and not in_double_quote and not in_triple_single and not in_triple_double:
                in_single_quote = not in_single_quote
            elif char == '#' and not in_single_quote and not in_double_quote and not in_triple_single and not in_triple_double:
                comment_index = i
                break
            i += 1
            
        if comment_index != -1:
            line_val = line[:comment_index].rstrip()
            cleaned.append(line_val)
        else:
            cleaned.append(line)
            

    content = "\n".join(cleaned)

    content = re.sub(r'^\s*"""[\s\S]*?"""\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\s*\'\'\'[\s\S]*?\'\'\'\s*$', '', content, flags=re.MULTILINE)
    return content

def strip_js_css_comments(source, is_css=False):
    out = []
    i = 0
    n = len(source)
    
    in_single_quote = False
    in_double_quote = False
    in_backtick = False
    in_regex = False
    in_line_comment = False
    in_block_comment = False
    
    while i < n:
        if in_line_comment:
            if source[i] == '\n':
                in_line_comment = False
                out.append('\n')
            i += 1
            continue
            
        if in_block_comment:
            if i + 1 < n and source[i:i+2] == '*/':
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue
            
        if (in_single_quote or in_double_quote or in_backtick or in_regex) and source[i] == '\\':
            out.append(source[i:i+2])
            i += 2
            continue
            
        if not in_block_comment and not in_line_comment:
            if source[i] == "'" and not in_double_quote and not in_backtick and not in_regex:
                in_single_quote = not in_single_quote
                out.append(source[i])
                i += 1
                continue
            if source[i] == '"' and not in_single_quote and not in_backtick and not in_regex:
                in_double_quote = not in_double_quote
                out.append(source[i])
                i += 1
                continue
            if source[i] == '`' and not in_single_quote and not in_double_quote and not in_regex:
                in_backtick = not in_backtick
                out.append(source[i])
                i += 1
                continue
                
        if not in_single_quote and not in_double_quote and not in_backtick and not in_regex:
            if i + 1 < n and source[i:i+2] == '/*':
                in_block_comment = True
                i += 2
                continue
            if not is_css and i + 1 < n and source[i:i+2] == '//':
                in_line_comment = True
                i += 2
                continue
                
        out.append(source[i])
        i += 1
        
    return "".join(out)

def strip_html_comments(source):
    return re.sub(r'<!--[\s\S]*?-->', '', source)

def process_file(filepath):
    _, ext = os.path.splitext(filepath)
    ext = ext.lower()
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        if ext == '.py':
            cleaned = strip_python_comments(content)
        elif ext in ['.js', '.jsx', '.ts', '.tsx']:
            cleaned = strip_js_css_comments(content, is_css=False)
        elif ext == '.css':
            cleaned = strip_js_css_comments(content, is_css=True)
        elif ext == '.html':
            cleaned = strip_html_comments(content)
        else:
            return False
            
        if content != cleaned:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(cleaned)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        
    return False

def main():
    workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    print(f"Scanning workspace root: {workspace_root}")
    
    exclude_dirs = {'.venv', 'venv', 'node_modules', '.git', 'dist', '.gemini', 'uploads', 'migrations'}
    target_extensions = {'.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.html'}
    
    modified_count = 0
    scanned_count = 0
    
    for root, dirs, files in os.walk(workspace_root):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            _, ext = os.path.splitext(file)
            if ext.lower() in target_extensions:
                filepath = os.path.join(root, file)
                scanned_count += 1
                if process_file(filepath):
                    print(f"Cleaned comments from: {os.path.relpath(filepath, workspace_root)}")
                    modified_count += 1
                    
    print(f"\nScan completed! Scanned {scanned_count} files. Modified {modified_count} files.")

if __name__ == "__main__":
    main()