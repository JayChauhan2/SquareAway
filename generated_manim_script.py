from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction
        question_text = Tex("Which of the following is the Maclaurin series for $e^x$?")
        question_text.to_edge(UP)
        self.play(Write(question_text))
        self.wait(2)
        self.play(FadeOut(question_text))

        # Step 2: Maclaurin Series Definition
        maclaurin_title = Tex("Maclaurin Series Definition")
        maclaurin_title.move_to(UP * 2.5)
        
        maclaurin_formula = MathTex(
            "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!} x^n"
        )
        maclaurin_formula.move_to(ORIGIN)

        self.play(Write(maclaurin_title))
        self.play(Write(maclaurin_formula))
        self.wait(3)
        self.play(FadeOut(maclaurin_title), FadeOut(maclaurin_formula))

        # Step 3: Applying to e^x
        function_text = Tex("For $f(x) = e^x$:").move_to(UP * 2.5)
        derivatives_intro = Tex("Derivatives at $x=0$:").move_to(ORIGIN)
        
        self.play(Write(function_text))
        self.play(Write(derivatives_intro))
        self.wait(2)

        # Displaying derivatives and their values at x=0
        derivs_and_vals = VGroup()
        f_x = MathTex("f(x) = e^x")
        f_0 = MathTex("f(0) = e^0 = 1")
        
        f_prime = MathTex("f'(x) = e^x")
        f_prime_0 = MathTex("f'(0) = e^0 = 1")
        
        f_double_prime = MathTex("f''(x) = e^x")
        f_double_prime_0 = MathTex("f''(0) = e^0 = 1")

        f_x.move_to(UP * 1)
        f_0.move_to(DOWN * 0.5)
        
        f_prime.move_to(UP * 1.5) # Adjust position to be clear of f_x
        f_prime_0.move_to(DOWN * 0) # Adjust position

        f_double_prime.move_to(UP * 2) # Adjust position further up
        f_double_prime_0.move_to(DOWN * 1) # Adjust position

        # Positioning for clarity, avoiding overlap
        f_x.move_to(UP * 1.5 + LEFT * 3)
        f_0.move_to(DOWN * 0.5 + LEFT * 3)
        
        f_prime.move_to(UP * 1.5 + ORIGIN)
        f_prime_0.move_to(DOWN * 0.5 + ORIGIN)

        f_double_prime.move_to(UP * 1.5 + RIGHT * 3)
        f_double_prime_0.move_to(DOWN * 0.5 + RIGHT * 3)

        self.play(
            FadeOut(derivatives_intro),
            Write(f_x.move_to(UP*2.5 + LEFT*3)),
            Write(f_0.move_to(UP*1.5 + LEFT*3))
        )
        self.wait(1)
        self.play(
            Write(f_prime.move_to(UP*2.5 + ORIGIN)),
            Write(f_prime_0.move_to(UP*1.5 + ORIGIN))
        )
        self.wait(1)
        self.play(
            Write(f_double_prime.move_to(UP*2.5 + RIGHT*3)),
            Write(f_double_prime_0.move_to(UP*1.5 + RIGHT*3))
        )
        self.wait(3)
        
        self.play(FadeOut(function_text), FadeOut(f_x), FadeOut(f_0), FadeOut(f_prime), FadeOut(f_prime_0), FadeOut(f_double_prime), FadeOut(f_double_prime_0))

        # Step 4: Resulting Series
        result_title = Tex("Resulting Maclaurin Series for $e^x$").move_to(UP * 2.5)
        
        # The series: 1 + x + x^2/2! + x^3/3! + ...
        series_terms = MathTex(
            "1", "+", "x", "+", "\\frac{x^2}{2!}", "+", "\\frac{x^3}{3!}", "+", "\\cdots"
        )
        series_terms.move_to(ORIGIN)

        # Correct positioning to avoid overlap
        terms_group = VGroup()
        terms_group.add(series_terms[0:9]) # All terms from series_terms

        # Distribute terms across regions
        series_terms[0].move_to(LEFT * 3) # 1
        series_terms[1].move_to(LEFT * 1.5) # +
        series_terms[2].move_to(ORIGIN) # x
        series_terms[3].move_to(RIGHT * 1.5) # +
        series_terms[4].move_to(RIGHT * 3) # x^2/2!
        series_terms[5].move_to(LEFT * 2) # + (for x^3/3!)
        series_terms[6].move_to(ORIGIN + DOWN * 1) # x^3/3!
        series_terms[7].move_to(RIGHT * 2) # + (for ...)
        series_terms[8].move_to(RIGHT * 4) # ...

        self.play(Write(result_title))
        self.play(Write(series_terms))
        self.wait(5)
        self.play(FadeOut(result_title), FadeOut(series_terms))
        
        self.wait(1) # Final pause