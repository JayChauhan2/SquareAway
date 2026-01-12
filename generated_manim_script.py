from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction to the problem
        problem_title = Tex("Maclaurin Series Problem").to_edge(UP, buff=1)
        problem_statement = MathTex(
            "\\text{Find the first non-zero term of the Maclaurin series for }",
            "f(x) = \\frac{\\cos(x) - 1}{x^2}"
        ).move_to(UP * 1.5)
        self.play(Write(problem_title))
        self.play(Write(problem_statement))
        self.wait(2)
        self.clear()

        # Step 2: Maclaurin series for cos(x)
        cos_series_title = Tex("Maclaurin Series for $\\cos(x)$").to_edge(UP, buff=1)
        cos_series_eq = MathTex(
            "\\cos(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}",
            " = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\frac{x^6}{6!} + \\dots"
        ).move_to(ORIGIN)
        self.play(Write(cos_series_title))
        self.play(Write(cos_series_eq[0]))
        self.play(Write(cos_series_eq[1]))
        self.wait(3)
        self.clear()

        # Step 3: Subtracting 1
        minus_one_title = Tex("$\\cos(x) - 1$").to_edge(UP, buff=1)
        minus_one_eq_part1 = MathTex(
            "\\cos(x) - 1 = \\left( 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\frac{x^6}{6!} + \\dots \\right) - 1"
        ).move_to(UP * 1)
        minus_one_eq_part2 = MathTex(
            "= -\\frac{x^2}{2!} + \\frac{x^4}{4!} - \\frac{x^6}{6!} + \\dots"
        ).move_to(DOWN * 0.5)
        self.play(Write(minus_one_title))
        self.play(Write(minus_one_eq_part1))
        self.wait(1)
        self.play(Transform(minus_one_eq_part1, minus_one_eq_part2))
        self.wait(3)
        self.clear()

        # Step 4: Dividing by x^2
        div_x2_title = Tex("Dividing by $x^2$").to_edge(UP, buff=1)
        div_x2_eq_part1 = MathTex(
            "f(x) = \\frac{\\cos(x) - 1}{x^2} = \\frac{1}{x^2} \\left( -\\frac{x^2}{2!} + \\frac{x^4}{4!} - \\frac{x^6}{6!} + \\dots \\right)"
        ).move_to(UP * 1)
        div_x2_eq_part2 = MathTex(
            "= -\\frac{1}{2!} + \\frac{x^2}{4!} - \\frac{x^4}{6!} + \\dots"
        ).move_to(DOWN * 0.5)
        self.play(Write(div_x2_title))
        self.play(Write(div_x2_eq_part1))
        self.wait(1)
        self.play(Transform(div_x2_eq_part1, div_x2_eq_part2))
        self.wait(3)
        self.clear()

        # Step 5: First non-zero term
        first_term_title = Tex("First Non-Zero Term").to_edge(UP, buff=1)
        first_term_eq = MathTex(
            "f(x) = \\boxed{-\\frac{1}{2!}} + \\frac{x^2}{4!} - \\frac{x^4}{6!} + \\dots"
        ).move_to(ORIGIN)
        self.play(Write(first_term_title))
        self.play(Write(first_term_eq))
        self.wait(3)
        self.play(
            first_term_eq[0][0].animate.set_color(YELLOW), # Bounding box
            first_term_eq[0][1].animate.set_color(YELLOW), # -
            first_term_eq[0][2].animate.set_color(YELLOW), # 1
            first_term_eq[0][3].animate.set_color(YELLOW), # /
            first_term_eq[0][4].animate.set_color(YELLOW), # 2
            first_term_eq[0][5].animate.set_color(YELLOW), # !
        )
        self.wait(2)