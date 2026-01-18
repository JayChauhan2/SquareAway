from manim import *

class Explainer(Scene):
    def construct(self):
        # Introduction to Addition
        apples1 = Circle(radius=0.2, color=RED).move_to(LEFT*3 + UP)
        apples2 = Circle(radius=0.2, color=RED).move_to(LEFT*2 + UP)
        apples3 = Circle(radius=0.2, color=RED).move_to(LEFT*1 + UP)
        apples4 = Circle(radius=0.2, color=RED).move_to(RIGHT*1 + UP)
        apples5 = Circle(radius=0.2, color=RED).move_to(RIGHT*2 + UP)

        self.play(FadeIn(apples1), FadeIn(apples2))
        self.wait(0.5)
        self.play(FadeIn(apples3), FadeIn(apples4), FadeIn(apples5))
        self.wait(1)
        add_eq = MathTex("2 + 3 = 5").move_to(DOWN)
        self.play(Write(add_eq))
        self.wait(1)
        self.clear()

        # Defining Addends and Sum
        add_eq = MathTex("2 + 3 = 5").move_to(UP)
        addend1 = Tex("Addend").next_to(add_eq[0], DOWN).set_color(BLUE)
        addend2 = Tex("Addend").next_to(add_eq[2], DOWN).set_color(BLUE)
        sum_label = Tex("Sum").next_to(add_eq[4], DOWN).set_color(GREEN)

        self.play(Write(add_eq))
        self.wait(0.5)
        self.play(Write(addend1), Write(addend2), Write(sum_label))
        self.wait(1)
        self.clear()

        # The Plus Sign
        plus_sign = MathTex("+").move_to(ORIGIN)
        plus_text = Tex("Plus Sign").next_to(plus_sign, DOWN)
        self.play(Write(plus_sign))
        self.wait(0.5)
        self.play(Write(plus_text))
        self.wait(1)
        self.clear()

        # Commutative Property
        commutative_eq1 = MathTex("2 + 3 = 5").move_to(UP)
        commutative_eq2 = MathTex("3 + 2 = 5").move_to(DOWN)
        self.play(Write(commutative_eq1))
        self.wait(0.5)
        self.play(Write(commutative_eq2))
        self.wait(1)

        objects1 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(2)]).arrange(RIGHT).move_to(LEFT*3 + UP*0.5)
        objects2 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(3)]).arrange(RIGHT).next_to(objects1, RIGHT)
        objects3 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(3)]).arrange(RIGHT).move_to(LEFT*3 + DOWN*0.5)
        objects4 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(2)]).arrange(RIGHT).next_to(objects3, RIGHT)

        self.play(FadeIn(objects1), FadeIn(objects2))
        self.wait(0.5)
        self.play(FadeIn(objects3), FadeIn(objects4))
        self.wait(1)
        self.clear()

        # Associative Property
        assoc_eq1 = MathTex("(2 + 3) + 4 = 9").move_to(UP)
        assoc_eq2 = MathTex("2 + (3 + 4) = 9").move_to(DOWN)
        self.play(Write(assoc_eq1))
        self.wait(0.5)
        self.play(Write(assoc_eq2))
        self.wait(1)

        assoc_objects1 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(2)]).arrange(RIGHT).move_to(LEFT*3 + UP*0.5)
        assoc_objects2 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(3)]).arrange(RIGHT).next_to(assoc_objects1, RIGHT)
        assoc_objects3 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(4)]).arrange(RIGHT).next_to(assoc_objects2, RIGHT)

        assoc_objects4 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(2)]).arrange(RIGHT).move_to(LEFT*3 + DOWN*0.5)
        assoc_objects5 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(3)]).arrange(RIGHT).next_to(assoc_objects4, RIGHT)
        assoc_objects6 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(4)]).arrange(RIGHT).next_to(assoc_objects5, RIGHT)

        self.play(FadeIn(assoc_objects1), FadeIn(assoc_objects2), FadeIn(assoc_objects3))
        self.wait(0.5)
        self.play(FadeIn(assoc_objects4), FadeIn(assoc_objects5), FadeIn(assoc_objects6))
        self.wait(1)
        self.clear()

        # Identity Property
        identity_eq = MathTex("2 + 0 = 2").move_to(UP)
        self.play(Write(identity_eq))
        self.wait(1)

        identity_objects1 = VGroup(*[Circle(radius=0.2, color=RED) for _ in range(2)]).arrange(RIGHT).move_to(LEFT*2)
        identity_objects2 = Dot(radius=0.1, color=RED).move_to(RIGHT*2)

        self.play(FadeIn(identity_objects1), FadeIn(identity_objects2))
        self.wait(1)
        self.clear()

        # Real-world examples
        finger_count = Tex("Counting Fingers").move_to(UP)
        coin_add = Tex("Adding Coins").move_to(ORIGIN)
        toy_count = Tex("Counting Toys").move_to(DOWN)

        self.play(Write(finger_count))
        self.wait(0.5)
        self.play(Write(coin_add))
        self.wait(0.5)
        self.play(Write(toy_count))
        self.wait(1)
        self.clear()

        # Summary of Key Concepts
        summary_title = Tex("Key Concepts").move_to(UP*2)
        addends_sum = Tex("Addends: Numbers being added").move_to(UP*0.5 + LEFT*2)
        sum_def = Tex("Sum: Result of addition").move_to(UP*0.5 + RIGHT*2)
        plus_sign_def = Tex("Plus Sign: Addition operator").move_to(DOWN*0.5 + LEFT*2)
        properties = Tex("Commutative, Associative, Identity Properties").move_to(DOWN*0.5 + RIGHT*2)

        self.play(Write(summary_title))
        self.wait(0.5)
        self.play(Write(addends_sum), Write(sum_def), Write(plus_sign_def), Write(properties))
        self.wait(2)

        self.wait(1)