import re
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class CodeBlock:
    """Represents a Python code block extracted from markdown."""
    content: str
    start_line: int
    end_line: int


class MarkdownPythonParser:
    """Parser for extracting Python code blocks from markdown format."""
    
    # Regex pattern to match ```py ... ``` blocks
    PYTHON_CODE_PATTERN = r'```py\n*([\s\S]*?)\n*```'
    
    def __init__(self, base_directory: str = "."):
        """
        Initialize the parser.
        
        Args:
            base_directory: Base directory where files will be created
        """
        self.base_directory = base_directory
    
    def _clean_content(self, content: str) -> str:
        """
        Clean up code content by removing excessive whitespace.
        
        Args:
            content: Raw code content
            
        Returns:
            Cleaned content
        """
        lines = content.split('\n')
        
        # Remove empty lines at the beginning and end
        while lines and not lines[0].strip():
            lines.pop(0)
        while lines and not lines[-1].strip():
            lines.pop()
        
        if not lines:
            return ""
        
        # Find minimum indentation (excluding empty lines)
        min_indent = float('inf')
        for line in lines:
            line = line.rstrip()
            if line.strip():  # Skip empty lines
                indent = len(line) - len(line.lstrip())
                min_indent = min(min_indent, indent)
        
        
        # Remove common indentation
        if min_indent != float('inf') and min_indent > 0:
            cleaned_lines = []
            for line in lines:
                if line.strip():  # Non-empty line
                    cleaned_lines.append(line[min_indent:])
                else:  # Empty line
                    cleaned_lines.append("")
            lines = cleaned_lines
        
        return '\n'.join(lines)

    def parse_response(self, text_content: str) -> List[CodeBlock]:
        """
        Parse text content and extract all Python code blocks.
        
        Args:
            text_content: The raw text content containing ```py blocks
            
        Returns:
            List of CodeBlock objects
        """
        code_blocks = []
        # lines = text_content.split('\n')
        
        # Find all Python code blocks
        matches = re.finditer(
            self.PYTHON_CODE_PATTERN, 
            text_content, 
            re.DOTALL | re.IGNORECASE
        )
        
        for i, match in enumerate(matches):
            content = match.group(1)
            content = self._clean_content(content)

            if content.startswith("thon"):
                content = content[len("thon"):]
            
            # Calculate line numbers for this match
            start_pos = match.start()
            lines_before = text_content[:start_pos].count('\n')
            lines_in_content = content.count('\n')
            
            code_block = CodeBlock(
                content=content,
                start_line=lines_before + 2,  # +1 for ```py line, +1 for 0-based index
                end_line=lines_before + 2 + lines_in_content
            )
            code_blocks.append(code_block)
        
        return code_blocks
    
    def extract_single_code_block(self, text_content: str) -> Optional[str]:
        """
        Extract the first Python code block found.
        
        Args:
            text_content: The raw text content
            
        Returns:
            The content of the first code block, or None if no blocks found
        """
        code_blocks = self.parse_response(text_content)
        return code_blocks[0].content if code_blocks else None
    
    def extract_all_code_blocks(self, text_content: str) -> List[str]:
        """
        Extract all Python code blocks as a list of strings.
        
        Args:
            text_content: The raw text content
            
        Returns:
            List of code block contents
        """
        code_blocks = self.parse_response(text_content)
        return [block.content for block in code_blocks]
    
    def create_file(self, code_content: str, filename: str = "main.py", 
                   target_directory: Optional[str] = None) -> str:
        """
        Create a single Python file from code content.
        
        Args:
            code_content: The Python code content
            filename: Name of the file to create
            target_directory: Directory to create file in (overrides base_directory)
            
        Returns:
            Path to the created file
        """
        if target_directory is None:
            target_directory = self.base_directory
        
        # Create directory if it doesn't exist
        os.makedirs(target_directory, exist_ok=True)
        
        # Create file path
        file_path = os.path.join(target_directory, filename)
        
        # Write file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code_content)
        
        return file_path
    
    def create_files_from_blocks(self, code_blocks: List[CodeBlock], 
                                base_filename: str = "code_block",
                                target_directory: Optional[str] = None) -> List[str]:
        """
        Create multiple Python files from code blocks.
        
        Args:
            code_blocks: List of CodeBlock objects
            base_filename: Base name for files (will be numbered)
            target_directory: Directory to create files in
            
        Returns:
            List of created file paths
        """
        if target_directory is None:
            target_directory = self.base_directory
        
        created_files = []
        
        for i, block in enumerate(code_blocks):
            if len(code_blocks) == 1:
                filename = f"{base_filename}.py"
            else:
                filename = f"{base_filename}_{i+1}.py"
            
            file_path = self.create_file(
                block.content, 
                filename, 
                target_directory
            )
            created_files.append(file_path)
        
        return created_files
    
    def parse_and_create_file(
        self, text_content: str, 
        filename: str = "main.py",
        target_directory: Optional[str] = None,
        use_first_block: bool = True
    ) -> Optional[str]:
        """
        Parse text content and create a Python file from the first code block.
        
        Args:
            text_content: The raw text content
            filename: Name of the file to create
            target_directory: Directory to create file in
            use_first_block: If True, use only the first block; if False, combine all blocks
            
        Returns:
            Path to the created file, or None if no code blocks found
        """
        code_blocks = self.parse_response(text_content)
        
        if not code_blocks:
            return None
        
        if use_first_block:
            code_content = code_blocks[0].content
            print(code_content)
        else:
            # Combine all code blocks with separators
            code_content = '\n\n# ' + '='*50 + '\n\n'.join(
                block.content for block in code_blocks
            )
        
        return self.create_file(code_content, filename, target_directory)
    
    def parse_and_return_code(self, text_content: str) -> Optional[str]:
        code_blocks = self.parse_response(text_content)

        if not code_blocks:
            return None
        
        return code_blocks[0].content
    
    def parse_and_create_multiple_files(
        self, 
        text_content: str,
        base_filename: str = "code_block",
        target_directory: Optional[str] = None
    ) -> List[str]:
        """
        Parse text content and create multiple Python files from all code blocks.
        
        Args:
            text_content: The raw text content
            base_filename: Base name for files
            target_directory: Directory to create files in
            
        Returns:
            List of created file paths
        """
        code_blocks = self.parse_response(text_content)
        return self.create_files_from_blocks(code_blocks, base_filename, target_directory)
    
    def get_code_block_info(self, text_content: str) -> List[Dict]:
        """
        Get information about all code blocks without extracting content.
        
        Args:
            text_content: The raw text content
            
        Returns:
            List of dictionaries with code block information
        """
        code_blocks = self.parse_response(text_content)
        
        info = []
        for i, block in enumerate(code_blocks):
            info.append({
                'index': i,
                'start_line': block.start_line,
                'end_line': block.end_line,
                'line_count': block.content.count('\n') + 1,
                'char_count': len(block.content),
                'has_imports': 'import ' in block.content,
                'has_classes': 'class ' in block.content,
                'has_functions': 'def ' in block.content
            })
        
        return info


# Example usage and testing
def main():
    """Example usage of the MarkdownPythonParser."""
    
    # Sample markdown content with Python code blocks
    sample_content = '''
    Here's some Python code to create a simple animation:
    
    ```py
    from manim import *
    
    class SimpleAnimation(Scene):
        def construct(self):
            circle = Circle()
            self.play(Create(circle))
            self.wait(1)
    ```
    
    And here's another code block with utilities:
    
    ```py
    def helper_function():
        return "This is a helper"
    
    def another_helper():
        print("Another helper function")
    ```
    
    That's all the code!
    '''
    
    # Create parser
    parser = MarkdownPythonParser(base_directory="./output")
    
    # Parse and get information
    code_blocks = parser.parse_response(sample_content)
    print(f"Found {len(code_blocks)} code block(s):")
    
    for i, block in enumerate(code_blocks):
        print(f"  Block {i+1}:")
        print(f"    Lines: {block.start_line}-{block.end_line}")
        print(f"    Length: {len(block.content)} characters")
        preview = block.content.split('\n')[0][:50]
        print(f"    Preview: {preview}...")
    
    # Get detailed info
    info = parser.get_code_block_info(sample_content)
    print("\nDetailed information:")
    for block_info in info:
        print(f"  Block {block_info['index']+1}: {block_info['line_count']} lines, "
              f"has imports: {block_info['has_imports']}, "
              f"has classes: {block_info['has_classes']}")
    
    # Create single file from first block
    single_file = parser.parse_and_create_file(
        sample_content,
        "main.py",
        "./output"
    )
    
    if single_file:
        print(f"\nCreated single file: {single_file}")
    
    # Extract just the code content
    all_code = parser.extract_all_code_blocks(sample_content)
    print(f"\nExtracted {len(all_code)} code blocks as strings")


if __name__ == "__main__":
    main()