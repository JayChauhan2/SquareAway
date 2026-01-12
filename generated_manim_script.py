from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title
        title = Text("Fermat's Little Theorem", font_size=40)
        title.move_to(UP*3)
        self.play(Write(title))
        self.wait(1)

        # Step 2: Theorem statement
        statement = Tex("If $p$ is prime and $a$ not divisible by $p$, then:")
        statement.move_to(UP*1)
        self.play(Write(statement))
        self.wait(1)

        # Step 3: First equation
        eq1 = MathTex("a^{p-1} \\equiv 1 \\pmod{p}")
        eq1.move_to(DOWN*1)
        self.play(Write(eq1))
        self.wait(2)

        # Step 4: Alternative statement
        alt_statement = Tex("For any integer $a$:")
        alt_statement.move_to(UP*1)
        self.play(Transform(statement, alt_statement))
        self.wait(1)

        # Step 5: Second equation
        eq2 = MathTex("a^p \\equiv a \\pmod{p}")
        eq2.move_to(DOWN*1)
        self.play(Transform(eq1, eq2))
        self.wait(2)

        # Step 6: Example
        self.clear()
        example_title = Text("Example: p=5, a=2", font_size=30)
        example_title.move_to(UP*3)

        calc1 = MathTex("2^4 = 16")
        calc1.move_to(UP*1)

        result1 = MathTex("16 \\equiv 1 \\pmod{5}")
        result1.move_to(DOWN*1)

        calc2 = MathTex("2^5 = 32")
        calc2.move_to(UP*0.5)

        result2 = MathTex("32 \\equiv 2 \\pmod{5}")
        result2.move_to(DOWN*1.5)

        self.play(Write(example_title))
        self.wait(0.5)
        self.play(Write(calc1))
        self.wait(0.5)
        self.play(Write(result1))
        self.wait(1)
        self.play(Write(calc2))
        self.wait(0.5)
        self.play(Write(result2))
        self.wait(2)

        # Step 7: Summary
        self.clear()
        summary = Text("Key Points:", font_size=30)
        summary.move_to(UP*3)

        point1 = Tex("• Connects primes and modular arithmetic")
        point1.move_to(UP*1)

        point2 = Tex("• Fundamental in number theory")
        point2.move_to(DOWN*1)

        self.play(Write(summary))
        self.wait(0.5)
        self.play(Write(point1))
        self.wait(0.5)
        self.play(Write(point2))
        self.wait(2)

        self.wait(1)  # Total duration placeholder