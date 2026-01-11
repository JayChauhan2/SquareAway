from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Title with historical context
        title = Text("Fermat's Little Theorem", font_size=40)
        title.move_to(UP*3)
        self.play(Write(title))
        self.wait(1)

        # Historical context
        context = Tex("Discovered by Pierre de Fermat (1601-1665)", font_size=24)
        context.move_to(UP*2)
        self.play(Write(context))
        self.wait(1)

        # Step 2: Theorem statement with conditions
        statement = Tex("If $p$ is prime and $a$ not divisible by $p$, then:")
        statement.move_to(UP*1)
        self.play(Write(statement))
        self.wait(1)

        # Step 3: First equation with explanation
        eq1 = MathTex("a^{p-1} \\equiv 1 \\pmod{p}")
        eq1.move_to(DOWN*1)
        self.play(Write(eq1))
        self.wait(2)

        # Intuition box
        intuition = Tex("Intuition: In modular arithmetic with prime $p$,", "\\\\",
                       "the numbers 1 to $p-1$ form a multiplicative group.", font_size=24)
        intuition.move_to(DOWN*2)
        self.play(Write(intuition))
        self.wait(2)

        # Step 4: Alternative statement
        alt_statement = Tex("For any integer $a$ (including multiples of $p$):")
        alt_statement.move_to(UP*1)
        self.play(Transform(statement, alt_statement))
        self.wait(1)

        # Step 5: Second equation
        eq2 = MathTex("a^p \\equiv a \\pmod{p}")
        eq2.move_to(DOWN*1)
        self.play(Transform(eq1, eq2))
        self.wait(2)

        # Step 6: Example with step-by-step
        example = Tex("Example: $p=5$, $a=2$")
        example.move_to(UP*2)
        step1 = MathTex("2^1 \\equiv 2 \\pmod{5}")
        step1.move_to(DOWN*0.5)
        step2 = MathTex("2^2 \\equiv 4 \\pmod{5}")
        step2.move_to(DOWN*1)
        step3 = MathTex("2^3 \\equiv 3 \\pmod{5}")
        step3.move_to(DOWN*1.5)
        step4 = MathTex("2^4 \\equiv 1 \\pmod{5}")
        step4.move_to(DOWN*2)

        self.play(FadeOut(title), FadeOut(context), FadeOut(statement), FadeOut(eq1), FadeOut(intuition))
        self.play(Write(example))
        self.wait(1)
        self.play(Write(step1))
        self.wait(1)
        self.play(Write(step2))
        self.wait(1)
        self.play(Write(step3))
        self.wait(1)
        self.play(Write(step4))
        self.wait(2)

        # Step 7: Applications
        apps_title = Tex("Applications:", font_size=30)
        apps_title.move_to(UP*2)
        crypto = Tex("- RSA encryption uses this for key generation", font_size=24)
        crypto.move_to(UP*1)
        primality = Tex("- Primality testing (e.g., Fermat test)", font_size=24)
        primality.move_to(DOWN*0.5)

        self.play(FadeOut(example), FadeOut(step1), FadeOut(step2), FadeOut(step3), FadeOut(step4))
        self.play(Write(apps_title))
        self.wait(1)
        self.play(Write(crypto))
        self.wait(1)
        self.play(Write(primality))
        self.wait(2)

        # Final summary
        summary = Tex("Fundamental result connecting primes and modular arithmetic", font_size=28)
        summary.move_to(DOWN*2)
        self.play(Write(summary))
        self.wait(2)

        self.wait(1)  # Total duration placeholder