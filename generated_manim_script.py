from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction and Equation
        equation = MathTex("x^2 + 5x + 6 = 0")
        equation.move_to(CENTER)
        self.play(Write(equation))
        self.wait(2)

        # Step 2: General Form
        general_form = MathTex("ax^2 + bx + c = 0")
        general_form.move_to(UP * 2)
        self.play(Write(general_form))
        self.wait(2)

        # Step 3: Identifying 'a'
        a_label = Tex("a = 1 (coefficient of ", "$x^2$")
        a_label.move_to(LEFT * 3 + DOWN)
        self.play(Write(a_label))
        self.wait(2)

        # Step 4: Identifying 'b'
        b_label = Tex("b = 5 (coefficient of ", "x")
        b_label.move_to(CENTER * 0 + DOWN)
        self.play(Write(b_label))
        self.wait(2)

        # Step 5: Identifying 'c'
        c_label = Tex("c = 6 (constant term)")
        c_label.move_to(RIGHT * 3 + DOWN)
        self.play(Write(c_label))
        self.wait(2)

        # Step 6: Recap
        recap = VGroup(
            Tex("Therefore:"),
            MathTex("a = 1, b = 5, c = 6")
        ).arrange(DOWN)
        recap.move_to(DOWN * 2)
        self.play(Write(recap))
        self.wait(3)