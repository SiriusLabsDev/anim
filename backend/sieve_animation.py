from manim import *

class SieveOfEratosthenes(Scene):
    def construct(self):
        # Configuration
        self.limit = 30  # Find primes up to 30
        self.grid_rows = 5
        self.grid_cols = 6
        
        # Title
        title = Text("Sieve of Eratosthenes", font_size=48, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        # Subtitle explaining the algorithm
        subtitle = Text("Finding all prime numbers up to 30", font_size=24, color=WHITE)
        subtitle.next_to(title, DOWN, buff=0.3)
        self.play(Write(subtitle))
        self.wait(2)
        
        # Create grid of numbers 2 to 30
        self.create_number_grid()
        
        # Show algorithm steps
        self.sieve_algorithm()
        
        # Final summary
        self.show_final_primes()
    
    def create_number_grid(self):
        """Create a grid of numbers from 2 to limit"""
        self.number_objects = {}
        self.grid_group = VGroup()
        
        # Calculate positions
        start_x = -3
        start_y = 1
        spacing_x = 1.2
        spacing_y = 0.8
        
        for i in range(2, self.limit + 1):
            row = (i - 2) // self.grid_cols
            col = (i - 2) % self.grid_cols
            
            x = start_x + col * spacing_x
            y = start_y - row * spacing_y
            
            # Create number with background circle
            circle = Circle(radius=0.3, color=WHITE, fill_opacity=0.1)
            number = Text(str(i), font_size=24, color=WHITE)
            
            number_group = VGroup(circle, number)
            number_group.move_to([x, y, 0])
            
            self.number_objects[i] = {
                'group': number_group,
                'circle': circle,
                'text': number,
                'is_prime': True,
                'is_marked': False
            }
            
            self.grid_group.add(number_group)
        
        self.play(Create(self.grid_group), run_time=2)
        self.wait(1)
        
        # Add explanation
        explanation = Text("Start with all numbers from 2 to 30", 
                         font_size=20, color=YELLOW)
        explanation.to_edge(DOWN)
        self.play(Write(explanation))
        self.wait(2)
        self.play(FadeOut(explanation))
    
    def sieve_algorithm(self):
        """Implement the sieve algorithm with animations"""
        current_prime = 2
        
        while current_prime * current_prime <= self.limit:
            # Highlight current prime
            self.highlight_current_prime(current_prime)
            
            # Mark multiples
            self.mark_multiples(current_prime)
            
            # Find next prime
            current_prime = self.find_next_prime(current_prime)
        
        # Mark remaining unmarked numbers as prime
        self.mark_remaining_primes()
    
    def highlight_current_prime(self, prime):
        """Highlight the current prime number"""
        prime_obj = self.number_objects[prime]
        
        # Change color to indicate it's the current prime
        self.play(
            prime_obj['circle'].animate.set_color(GREEN).set_fill(GREEN, 0.3),
            prime_obj['text'].animate.set_color(BLACK)
        )
        
        # Add explanation
        explanation = Text(f"Current prime: {prime}. Mark all its multiples.", 
                         font_size=20, color=GREEN)
        explanation.to_edge(DOWN)
        self.play(Write(explanation))
        self.wait(1)
        self.play(FadeOut(explanation))
    
    def mark_multiples(self, prime):
        """Mark multiples of the current prime as composite"""
        multiples = []
        
        # Find all multiples of prime (starting from prime^2)
        multiple = prime * prime
        while multiple <= self.limit:
            if multiple in self.number_objects and not self.number_objects[multiple]['is_marked']:
                multiples.append(multiple)
                self.number_objects[multiple]['is_marked'] = True
                self.number_objects[multiple]['is_prime'] = False
            multiple += prime
        
        if multiples:
            # Animate marking multiples
            animations = []
            for mult in multiples:
                mult_obj = self.number_objects[mult]
                animations.extend([
                    mult_obj['circle'].animate.set_color(RED).set_fill(RED, 0.3),
                    mult_obj['text'].animate.set_color(WHITE)
                ])
            
            self.play(*animations, run_time=1.5)
            
            # Show explanation
            multiples_str = ", ".join(map(str, multiples))
            explanation = Text(f"Marked multiples of {prime}: {multiples_str}", 
                             font_size=18, color=RED)
            explanation.to_edge(DOWN)
            self.play(Write(explanation))
            self.wait(1.5)
            self.play(FadeOut(explanation))
    
    def find_next_prime(self, current_prime):
        """Find the next unmarked number (next prime)"""
        next_prime = current_prime + 1
        while (next_prime <= self.limit and 
               next_prime in self.number_objects and 
               self.number_objects[next_prime]['is_marked']):
            next_prime += 1
        
        return next_prime if next_prime <= self.limit else None
    
    def mark_remaining_primes(self):
        """Mark all remaining unmarked numbers as primes"""
        remaining_primes = []
        
        for num in range(2, self.limit + 1):
            if (num in self.number_objects and 
                not self.number_objects[num]['is_marked'] and 
                self.number_objects[num]['circle'].color != GREEN):
                remaining_primes.append(num)
        
        if remaining_primes:
            animations = []
            for prime in remaining_primes:
                prime_obj = self.number_objects[prime]
                animations.extend([
                    prime_obj['circle'].animate.set_color(GREEN).set_fill(GREEN, 0.3),
                    prime_obj['text'].animate.set_color(BLACK)
                ])
            
            self.play(*animations, run_time=2)
            
            explanation = Text("All remaining numbers are prime!", 
                             font_size=20, color=GREEN)
            explanation.to_edge(DOWN)
            self.play(Write(explanation))
            self.wait(2)
            self.play(FadeOut(explanation))
    
    def show_final_primes(self):
        """Show the final list of prime numbers"""
        # Collect all prime numbers
        primes = []
        for num in range(2, self.limit + 1):
            if (num in self.number_objects and 
                self.number_objects[num]['is_prime']):
                primes.append(num)
        
        # Create final summary
        primes_text = "Prime numbers up to 30: " + ", ".join(map(str, primes))
        summary = Text(primes_text, font_size=20, color=YELLOW)
        summary.to_edge(DOWN)
        
        self.play(Write(summary))
        self.wait(3)
        
        # Add algorithm complexity note
        complexity = Text("Time Complexity: O(n log log n)", 
                         font_size=18, color=BLUE)
        complexity.next_to(summary, UP, buff=0.3)
        self.play(Write(complexity))
        self.wait(3)

# Alternative scene with step-by-step explanation
class SieveExplanation(Scene):
    def construct(self):
        # Title
        title = Text("How the Sieve of Eratosthenes Works", 
                    font_size=36, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title))
        
        # Step-by-step explanation
        steps = [
            "1. List all numbers from 2 to n",
            "2. Start with the first prime number: 2",
            "3. Mark all multiples of 2 (except 2 itself)",
            "4. Find the next unmarked number - it's prime",
            "5. Repeat steps 3-4 until p² > n",
            "6. All unmarked numbers are prime"
        ]
        
        step_objects = []
        for i, step in enumerate(steps):
            step_text = Text(step, font_size=24, color=WHITE)
            step_text.to_edge(LEFT)
            step_text.shift(UP * (2 - i * 0.6))
            step_objects.append(step_text)
        
        # Animate each step
        for step_obj in step_objects:
            self.play(Write(step_obj))
            self.wait(1)
        
        self.wait(2)
        
        # Add efficiency note
        efficiency = Text("Why is it efficient?", font_size=28, color=YELLOW)
        efficiency.shift(DOWN * 2)
        self.play(Write(efficiency))
        
        reasons = [
            "• Only checks multiples, not division",
            "• Starts marking from p², not p",
            "• Stops when p² > n"
        ]
        
        for i, reason in enumerate(reasons):
            reason_text = Text(reason, font_size=20, color=GREEN)
            reason_text.next_to(efficiency, DOWN, buff=0.5)
            reason_text.shift(DOWN * i * 0.5)
            self.play(Write(reason_text))
            self.wait(1)
        
        self.wait(3)