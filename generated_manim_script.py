from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction with historical context
        title = Text("Fermat's Little Theorem", font_size=48)
        title.move_to(UP*3)
        self.play(Write(title))
        self.wait(1)

        context = Tex("Discovered by Pierre de Fermat in 1640", font_size=36)
        context.move_to(UP*1.5)
        self.play(Write(context))
        self.wait(2)

        # Step 2: Main statement with intuition
        theorem1 = MathTex("a^{p-1} \\equiv 1 \\pmod{p}")
        theorem1.move_to(UP*0.5)
        conditions = Tex("where $p$ is prime and $a$ not divisible by $p$")
        conditions.move_to(DOWN*0.5)
        self.play(Write(theorem1), Write(conditions))
        self.wait(2)

        # Intuition explanation with improved analogy
        intuition = Tex("Think of numbers modulo p as a clock with p hours", font_size=36)
        intuition.move_to(DOWN*1.5)
        self.play(Write(intuition))
        self.wait(2)

        # Step 3: Visual example with clock analogy
        example = MathTex("2^4 = 16 \\equiv 1 \\pmod{5}")
        example.move_to(DOWN*2.5)
        self.play(Write(example))
        self.wait(2)

        # Visual clock representation
        clock = Circle(radius=1.5)
        clock.move_to(DOWN*2.5)
        numbers = VGroup(*[Tex(str(i)).move_to(clock.point_at_angle(i*2*PI/5)) for i in range(5)])
        self.play(Create(clock), Write(numbers))
        self.wait(2)

        # Step 4: Alternative form with explanation
        self.play(FadeOut(example), FadeOut(clock), FadeOut(numbers))
        theorem2 = MathTex("a^p \\equiv a \\pmod{p}")
        theorem2.move_to(DOWN*0.5)
        self.play(Write(theorem2))
        self.wait(2)

        # Explanation of the alternative form
        alt_explanation = Tex("This form works for all integers a, including multiples of p", font_size=36)
        alt_explanation.move_to(DOWN*1.5)
        self.play(Write(alt_explanation))
        self.wait(2)

        # Example of alternative form
        alt_example = MathTex("3^5 = 243 \\equiv 3 \\pmod{5}")
        alt_example.move_to(DOWN*2.5)
        self.play(Write(alt_example))
        self.wait(2)

        # Step 5: Conditions explanation
        cond_text = Tex("Key conditions: $p$ prime, $a$ not divisible by $p$", font_size=36)
        cond_text.move_to(DOWN*3.5)
        self.play(Write(cond_text))
        self.wait(2)

        # Counterexample for non-prime
        counterexample = MathTex("2^3 = 8 \\equiv 0 \\pmod{4}", " (not 1)")
        counterexample.move_to(DOWN*4.5)
        self.play(Write(counterexample))
        self.wait(2)

        # Step 6: Summary with real-world application
        summary = Tex("Important in cryptography and number theory", font_size=36)
        summary.move_to(DOWN*5.5)
        self.play(Write(summary))
        self.wait(2)

        # Real-world application example
        app_example = Tex("Used in RSA encryption for secure communication", font_size=36)
        app_example.move_to(DOWN*6.5)
        self.play(Write(app_example))
        self.wait(3)

        # Total duration placeholder
        self.wait(1)