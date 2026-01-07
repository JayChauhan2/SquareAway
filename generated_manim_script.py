from manim import *

class Explainer(Scene):
    def construct(self):
        self.add_sound("voiceover.mp3")

        # Step 1: Introduction
        title = Text("Scalars vs Vectors", font_size=48)
        title.move_to(UP*3)
        self.play(Write(title))
        self.wait(1)

        # Step 2: Scalar definition
        scalar_def = MathTex("Scalar: magnitude only")
        scalar_def.move_to(UP*1 + LEFT*2)
        self.play(Write(scalar_def))
        self.wait(1)

        # Step 3: Scalar examples
        scalar_examples = BulletedList(
            "Temperature",
            "Mass",
            "Speed",
            buff=0.5
        )
        scalar_examples.move_to(DOWN*1 + LEFT*3)
        self.play(Write(scalar_examples))
        self.wait(1)

        # Step 4: Vector definition
        vector_def = MathTex("Vector: magnitude + direction")
        vector_def.move_to(UP*1 + RIGHT*2)
        self.play(Write(vector_def))
        self.wait(1)

        # Step 5: Vector examples
        vector_examples = BulletedList(
            "Velocity",
            "Force",
            "Displacement",
            buff=0.5
        )
        vector_examples.move_to(DOWN*1 + RIGHT*3)
        self.play(Write(vector_examples))
        self.wait(1)

        # Step 6: Comparison
        comparison = Text("Key Difference:", font_size=36)
        comparison.move_to(DOWN*2.5)
        self.play(Write(comparison))

        scalar_arrow = Arrow(LEFT, RIGHT, color=BLUE)
        scalar_arrow.next_to(comparison, DOWN)
        scalar_label = Text("Scalar", font_size=24).next_to(scalar_arrow, DOWN)

        vector_arrow = Arrow(LEFT, RIGHT, color=RED)
        vector_arrow.next_to(scalar_arrow, DOWN)
        vector_label = Text("Vector", font_size=24).next_to(vector_arrow, DOWN)

        self.play(
            Create(scalar_arrow),
            Write(scalar_label),
            Create(vector_arrow),
            Write(vector_label)
        )
        self.wait(1)

        # Step 7: Conclusion
        conclusion = Text("Answer: The scalar is the quantity with only magnitude", font_size=32)
        conclusion.move_to(DOWN*3.5)
        self.play(Write(conclusion))
        self.wait(2)

        self.wait(1)  # Total duration placeholder