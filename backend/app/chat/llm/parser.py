import re
import os
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class VizmoCode:
    """Represents a code block within a vizmo artifact."""
    file_path: str
    content: str


@dataclass
class VizmoArtifact:
    """Represents a complete vizmo artifact with its ID and code blocks."""
    id: str
    code_blocks: List[VizmoCode]


class VizmoParser:
    """Parser for extracting vizmo artifacts from LLM responses."""
    
    # Regex patterns
    ARTIFACT_PATTERN = r'<vizmoArtifact\s+id="([^"]+)">(.*?)</vizmoArtifact>'
    CODE_PATTERN = r'<vizmoCode(?:\s+filePath="([^"]+)")?\s*>(.*?)</vizmoCode>'
    
    def __init__(self, base_directory: str = "."):
        """
        Initialize the parser.
        
        Args:
            base_directory: Base directory where files will be created
        """
        self.base_directory = base_directory
    
    def parse_response(self, llm_response: str) -> List[VizmoArtifact]:
        """
        Parse an LLM response and extract all vizmo artifacts.
        
        Args:
            llm_response: The raw response from the LLM
            
        Returns:
            List of VizmoArtifact objects
        """
        artifacts = []
        
        # Find all vizmo artifacts in the response
        artifact_matches = re.finditer(
            self.ARTIFACT_PATTERN, 
            llm_response, 
            re.DOTALL | re.IGNORECASE
        )
        
        for match in artifact_matches:
            artifact_id = match.group(1)
            artifact_content = match.group(2)
            
            # Parse code blocks within this artifact
            code_blocks = self._parse_code_blocks(artifact_content)
            
            artifact = VizmoArtifact(
                id=artifact_id,
                code_blocks=code_blocks
            )
            artifacts.append(artifact)
        
        return artifacts
    
    def _parse_code_blocks(self, artifact_content: str) -> List[VizmoCode]:
        """
        Parse code blocks within an artifact.
        
        Args:
            artifact_content: Content within a vizmoArtifact tag
            
        Returns:
            List of VizmoCode objects
        """
        code_blocks = []
        
        code_matches = re.finditer(
            self.CODE_PATTERN,
            artifact_content,
            re.DOTALL | re.IGNORECASE
        )
        
        for match in code_matches:
            file_path = match.group(1) or "main.py"  # Default to main.py if no path
            content = match.group(2)
            
            # Clean up the content (remove leading/trailing whitespace from each line)
            content = self._clean_content(content)
            
            code_block = VizmoCode(
                file_path=file_path,
                content=content
            )
            code_blocks.append(code_block)
        
        return code_blocks
    
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
    
    def create_files(self, artifacts: List[VizmoArtifact], 
                    target_directory: Optional[str] = None) -> Dict[str, List[str]]:
        """
        Create files from parsed artifacts.
        
        Args:
            artifacts: List of VizmoArtifact objects
            target_directory: Directory to create files in (overrides base_directory)
            
        Returns:
            Dictionary mapping artifact IDs to lists of created file paths
        """
        if target_directory is None:
            target_directory = self.base_directory
        
        created_files = {}
        
        for artifact in artifacts:
            artifact_files = []
            
            # Create directory for this artifact if it doesn't exist
            # artifact_dir = os.path.join(target_directory, artifact.id)
            artifact_dir = target_directory
            os.makedirs(artifact_dir, exist_ok=True)
            
            for code_block in artifact.code_blocks:
                # Resolve file path
                file_path = os.path.join(artifact_dir, code_block.file_path)
                
                # Create directory structure if needed
                file_dir = os.path.dirname(file_path)
                if file_dir:
                    os.makedirs(file_dir, exist_ok=True)
                
                # Write file
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(code_block.content)
                
                artifact_files.append(file_path)
            
            created_files[artifact.id] = artifact_files
        
        return created_files
    
    def parse_and_create_files(self, llm_response: str, 
                              target_directory: Optional[str] = None) -> Dict[str, List[str]]:
        """
        Parse LLM response and create files in one step.
        
        Args:
            llm_response: The raw response from the LLM
            target_directory: Directory to create files in
            
        Returns:
            Dictionary mapping artifact IDs to lists of created file paths
        """
        artifacts = self.parse_response(llm_response)
        return self.create_files(artifacts, target_directory)
    
    def validate_artifacts(self, artifacts: List[VizmoArtifact]) -> List[str]:
        """
        Validate parsed artifacts and return any issues found.
        
        Args:
            artifacts: List of VizmoArtifact objects
            
        Returns:
            List of validation error messages
        """
        issues = []
        
        for artifact in artifacts:
            # Check if artifact has at least one code block
            if not artifact.code_blocks:
                issues.append(f"Artifact '{artifact.id}' has no code blocks")
                continue
            
            # Check if there's a main.py file
            main_py_found = any(
                code.file_path == "main.py" 
                for code in artifact.code_blocks
            )
            
            if not main_py_found:
                issues.append(f"Artifact '{artifact.id}' missing main.py file")
            
            # Check for duplicate file paths
            file_paths = [code.file_path for code in artifact.code_blocks]
            duplicates = set()
            seen = set()
            
            for path in file_paths:
                if path in seen:
                    duplicates.add(path)
                seen.add(path)
            
            if duplicates:
                issues.append(
                    f"Artifact '{artifact.id}' has duplicate file paths: {duplicates}"
                )
        
        return issues
