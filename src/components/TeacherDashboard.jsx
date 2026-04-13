import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Users, Copy, Check, Plus, ArrowLeft } from 'lucide-react';
import KaTeXWrapper from './KaTeXWrapper';
import JSXGraph from "./JSXGraph";

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [className, setClassName] = useState('');
    const [creating, setCreating] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [copiedCode, setCopiedCode] = useState(null);

    // Assignment Creation State
    const [assignmentTopic, setAssignmentTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(5);
    const [questionTypes, setQuestionTypes] = useState({
        mcq: true,
        free: true,
        boolean: true,
        word: true
    });
    const [assigning, setAssigning] = useState(false);

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [assignmentDetail, setAssignmentDetail] = useState(null); // Holds stats and student breakdown

    // Question Review State
    const [reviewingQuestions, setReviewingQuestions] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        document.title = 'Teacher Dashboard - Square Away';
    }, []);

    useEffect(() => {
        if (user) {
            fetchClasses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            fetchClassData(selectedClass.id);
            setSelectedAssignment(null); // Reset assignment view on class switch
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setClasses(data);
        }
    };

    const fetchClassData = async (classId) => {
        // 1. Get Enrollments & Students
        const { data: enrollments, error } = await supabase
            .from('class_enrollments')
            .select('student_id, joined_at')
            .eq('class_id', classId);

        let studentList = [];
        if (!error && enrollments) {
            // Fetch user details from local backend
            let usersMap = {};
            try {
                const response = await fetch('/api/get-users');
                if (response.ok) {
                    const usersList = await response.json();
                    usersList.forEach(u => {
                        usersMap[u.id] = u;
                    });
                }
            } catch (err) {
                console.error("Error fetching users:", err);
            }

            studentList = enrollments.map((enrollment) => {
                const userData = usersMap[enrollment.student_id];
                let displayName = 'Unknown Student';
                if (userData && userData.name && userData.name !== 'Student') {
                    const parts = userData.name.trim().split(' ');
                    if (parts.length > 1) {
                        displayName = `${parts[0]} ${parts[parts.length - 1][0]}.`;
                    } else {
                        displayName = parts[0];
                    }
                } else if (enrollment.student_id) {
                    displayName = `Student (${enrollment.student_id.substring(0, 4)})`;
                }

                return {
                    id: enrollment.student_id,
                    name: displayName,
                    joinedAt: enrollment.joined_at,
                };
            });
            setStudents(studentList);
        }

        // 2. Fetch Assignments
        const { data: assignmentData, error: assignmentError } = await supabase
            .from('class_assignments')
            .select('*')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (!assignmentError && assignmentData) {
            setAssignments(assignmentData);
        }
    };

    const fetchAssignmentDetails = async (assignment) => {
        if (!assignment) return;

        // Fetch progress for this assignment
        const { data: progress, error } = await supabase
            .from('student_assignment_progress')
            .select('*')
            .eq('assignment_id', assignment.id);

        if (error) {
            console.error("Error fetching assignment details:", error);
            return;
        }

        // Combine with student list
        const studentProgress = students.map(student => {
            const p = progress.find(p => p.student_id === student.id);
            return {
                ...student,
                status: p ? 'Completed' : 'Pending',
                score: p ? p.score : null,
                completedAt: p ? p.completed_at : null,
                answers: p ? p.answers : null // Include answers
            };
        });

        // Calculate Stats
        const completedCount = studentProgress.filter(s => s.status === 'Completed').length;
        const totalScore = studentProgress.reduce((acc, s) => acc + (s.score || 0), 0);
        const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

        setAssignmentDetail({
            studentProgress,
            stats: {
                completed: completedCount,
                total: students.length,
                avgScore
            }
        });
        setSelectedAssignment(assignment);
    };

    const generateCode = () => {
        return Math.floor(10000 + Math.random() * 90000).toString();
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!className.trim()) return;

        setCreating(true);
        const code = generateCode();

        const { data, error } = await supabase
            .from('classes')
            .insert([{
                teacher_id: user.id,
                name: className,
                code: code
            }])
            .select();

        if (!error && data) {
            setClasses([data[0], ...classes]);
            setClassName('');
        }

        setCreating(false);
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!assignmentTopic.trim()) return;

        setAssigning(true);

        const typesList = [];
        if (questionTypes.mcq) typesList.push("multiple-choice");
        if (questionTypes.free) typesList.push("short answer/free response");
        if (questionTypes.boolean) typesList.push("true/false");
        if (questionTypes.word) typesList.push("word problems");

        if (typesList.length === 0) {
            alert("Please select at least one question type.");
            setAssigning(false);
            return;
        }

        try {
            // 1. Generate Questions via Backend
            const response = await fetch('/api/create-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: assignmentTopic,
                    count: questionCount,
                    types: typesList
                })
            });

            if (!response.ok) throw new Error("Failed to generate questions");
            const questions = await response.json();

            // 2. Save Assignment to Supabase
            const { data, error } = await supabase
                .from('class_assignments')
                .insert([{
                    class_id: selectedClass.id,
                    teacher_id: user.id,
                    topic: assignmentTopic,
                    questions: questions,
                    question_count: questionCount,
                    question_types: typesList
                }])
                .select();

            if (error) throw error;

            if (data) {
                setAssignments([data[0], ...assignments]);
            }

            alert("Assignment created successfully!");
            setAssignmentTopic('');
            setQuestionCount(5);
            // Optionally refresh assignments list if we display them
        } catch (err) {
            console.error("Error creating assignment:", err);
            alert("Error creating assignment: " + err.message);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen overflow-x-hidden pt-28 pb-6 px-6">

            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl top-10 left-5 animate-[blob_15s_linear_infinite]" />
                <div className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl bottom-20 right-10 animate-[blob_20s_linear_infinite]" />
                <div className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_18s_linear_infinite]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {!selectedClass ? (
                    <>
                        {/* Page Title */}
                        <h1 className="text-5xl md:text-6xl font-light text-slate-900 text-center mb-8">
                            Teacher Dashboard
                        </h1>

                        {/* Create Class Section */}
                        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200/50">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Create New Class</h2>

                            <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Class Name (e.g., Algebra 1 - Period 3)"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={creating || !className.trim()}
                                    className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    {creating ? 'Creating...' : 'Create Class'}
                                </button>
                            </form>
                        </div>

                        {/* Classes List */}
                        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200/50">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Your Classes</h2>

                            {classes.length === 0 ? (
                                <p className="text-slate-500 italic text-center py-8">No classes yet. Create your first class above!</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {classes.map((cls) => (
                                        <div
                                            key={cls.id}
                                            onClick={() => setSelectedClass(cls)}
                                            className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
                                        >
                                            <h3 className="font-semibold text-lg text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                                                {cls.name}
                                            </h3>

                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-500">Code:</span>
                                                    <span className="text-2xl font-bold text-blue-600 tracking-wider">{cls.code}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyCode(cls.code);
                                                    }}
                                                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                                    title="Copy code"
                                                >
                                                    {copiedCode === cls.code ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-slate-600" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">Click to view students</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // Class Details View
                    <>
                        <button
                            onClick={() => setSelectedClass(null)}
                            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Classes</span>
                        </button>

                        <h1 className="text-4xl font-light text-slate-900 mb-2">{selectedClass.name}</h1>
                        <p className="text-slate-600 mb-8">
                            Class Code: <span className="text-2xl font-bold text-blue-600 tracking-wider">{selectedClass.code}</span>
                        </p>

                        {/* Class Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-blue-100">
                                <p className="text-slate-500 font-medium mb-1">Total Students</p>
                                <p className="text-4xl font-bold text-slate-800">{students.length}</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-purple-100">
                                <p className="text-slate-500 font-medium mb-1">Avg Class Score</p>
                                <p className="text-4xl font-bold text-slate-800">
                                    {assignmentDetail?.stats.avgScore || 0}%
                                </p>
                            </div>
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-green-100">
                                <p className="text-slate-500 font-medium mb-1">Total Assignments</p>
                                <p className="text-4xl font-bold text-slate-800">
                                    {assignments.length}
                                </p>
                            </div>
                        </div>

                        {/* Create Assignment Section (New) */}
                        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-purple-200/50 mb-8">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Create Assignment</h2>
                            <form onSubmit={handleCreateAssignment} className="space-y-6">
                                {/* Topic */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Topic</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Linear Equations, Second Derivatives (The more specific the topic, the better the results)"
                                        value={assignmentTopic}
                                        onChange={(e) => setAssignmentTopic(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-slate-400"
                                    />
                                </div>

                                {/* Slider and Count */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-slate-700">Number of Questions</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={questionCount}
                                            onChange={(e) => setQuestionCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                                            className="w-20 px-2 py-1 text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                </div>

                                {/* Question Types */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Question Types</label>
                                    <div className="flex flex-wrap gap-4">
                                        {[
                                            { key: 'mcq', label: 'Multiple Choice' },
                                            { key: 'free', label: 'Free Response' },
                                            { key: 'boolean', label: 'True/False' },
                                            { key: 'word', label: 'Word Problems' }
                                        ].map((type) => (
                                            <label key={type.key} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={questionTypes[type.key]}
                                                    onChange={(e) => setQuestionTypes(prev => ({ ...prev, [type.key]: e.target.checked }))}
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                                                />
                                                <span className="text-sm text-slate-700">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={assigning || !assignmentTopic}
                                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {assigning ? 'Generating Assignment...' : 'Assign Questions'}
                                </button>
                            </form>
                        </div>

                        {/* Student List with Analytics */}
                        {/* Assignment List or Detail View */}
                        {!selectedAssignment ? (
                            <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200/50">
                                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Class Assignments</h2>

                                {assignments.length === 0 ? (
                                    <p className="text-slate-500 italic text-center py-8">No assignments created yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {assignments.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                onClick={() => fetchAssignmentDetails(assignment)}
                                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
                                            >
                                                <div>
                                                    <h3 className="font-semibold text-lg text-slate-800">{assignment.topic}</h3>
                                                    <p className="text-sm text-slate-500">
                                                        {assignment.question_count} Questions • Created {new Date(assignment.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-blue-600">
                                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <button
                                    onClick={() => setSelectedAssignment(null)}
                                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="font-medium">Back to Assignments</span>
                                </button>

                                <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-purple-200/50 mb-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedAssignment.topic}</h2>
                                            <p className="text-slate-500">
                                                Created {new Date(selectedAssignment.created_at).toLocaleDateString()} • {selectedAssignment.question_count} Questions
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setReviewingQuestions(true);
                                                    setCurrentQuestionIndex(0);
                                                }}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                                            >
                                                Review Questions
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                                            <p className="text-slate-500 text-sm font-medium mb-1">Completion Rate</p>
                                            <p className="text-3xl font-bold text-slate-800">
                                                {assignmentDetail?.stats.completed}/{assignmentDetail?.stats.total}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                                            <p className="text-slate-500 text-sm font-medium mb-1">Average Score</p>
                                            <p className="text-3xl font-bold text-slate-800">
                                                {assignmentDetail?.stats.avgScore}%
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                                            <p className="text-slate-500 text-sm font-medium mb-1">Questions</p>
                                            <p className="text-3xl font-bold text-slate-800">
                                                {selectedAssignment.question_count}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Question Review or Student List */}
                                    {reviewingQuestions ? (
                                        <div>
                                            <button
                                                onClick={() => setReviewingQuestions(false)}
                                                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                                <span className="font-medium">Back to Results</span>
                                            </button>

                                            {selectedAssignment.questions && selectedAssignment.questions.length > 0 && (
                                                <div className="bg-white rounded-xl p-8 border border-slate-200">
                                                    {(() => {
                                                        const question = selectedAssignment.questions[currentQuestionIndex];

                                                        // Helper function to normalize question type
                                                        const normalizeQuestionType = (type) => {
                                                            if (type === 'multiple-choice' || type === 'mcq') return 'mcq';
                                                            if (type === 'true/false' || type === 'boolean') return 'boolean';
                                                            if (type === 'short answer/free response' || type === 'free') return 'free';
                                                            if (type === 'word problems' || type === 'word') return 'word';
                                                            return type;
                                                        };

                                                        // Helper function to get answer data dynamically
                                                        const getAnswerData = (q) => {
                                                            // Get answer from question.answer or question.correct_answer
                                                            return q.answer || q.correct_answer || null;
                                                        };

                                                        // Helper function to check if an option matches the answer
                                                        const isOptionCorrect = (option, answerData) => {
                                                            if (!answerData) return false;

                                                            // If answer is an array, compare each part
                                                            if (Array.isArray(answerData)) {
                                                                // For MCQ/Boolean, answer is typically an array of parts
                                                                const answerStr = answerData.map(a => (a.content || a)).join(' ');
                                                                const optionStr = Array.isArray(option)
                                                                    ? option.map(o => (o.content || o)).join(' ')
                                                                    : String(option);
                                                                return answerStr === optionStr ||
                                                                    JSON.stringify(answerData) === JSON.stringify(option);
                                                            }

                                                            // If answer is a string
                                                            const answerStr = String(answerData);
                                                            const optionStr = Array.isArray(option)
                                                                ? option.map(o => (o.content || o)).join(' ')
                                                                : String(option);
                                                            return answerStr === optionStr;
                                                        };

                                                        const questionType = normalizeQuestionType(question.type);
                                                        const answerData = getAnswerData(question);

                                                        // ---- New: Calculate Per-Question Stats ----
                                                        let stats = { total: 0, correct: 0, options: {} };

                                                        if (assignmentDetail && assignmentDetail.studentProgress) {
                                                            assignmentDetail.studentProgress.forEach(s => {
                                                                if (s.status === 'Completed' && s.answers) {
                                                                    stats.total++;

                                                                    // Get student's answer for this question ID
                                                                    const studentAnsRaw = s.answers[question.id];
                                                                    if (studentAnsRaw) {
                                                                        // Check correctness
                                                                        let isRight = false;

                                                                        // Reuse logic from Questions.jsx or simplify 
                                                                        if (questionType === 'mcq' || questionType === 'boolean') {
                                                                            try {
                                                                                const parsed = JSON.parse(studentAnsRaw);
                                                                                // For MCQ, store which option was picked
                                                                                // Assume pased[0].content is the key
                                                                                const val = parsed[0]?.content || 'Unknown';
                                                                                stats.options[val] = (stats.options[val] || 0) + 1;

                                                                                if (answerData && answerData[0] && parsed[0]) {
                                                                                    isRight = (parsed[0].content === answerData[0].content);
                                                                                }
                                                                            } catch {
                                                                                // fail to parse
                                                                            }
                                                                        } else {
                                                                            // Free/Word
                                                                            // Since we don't store grading result in `answers` JSON, 
                                                                            // we can only track that they answered. 
                                                                            // Or do a rudimentary check. 
                                                                            // Let's count it as 'attempted'.
                                                                            // isRight = true; // Placeholder or skip correctness for free response
                                                                        }

                                                                        if (isRight) stats.correct++;
                                                                    }
                                                                }
                                                            });
                                                        }

                                                        const percentCorrect = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                                                        // -------------------------------------------

                                                        return (

                                                            <>
                                                                {/* Question Counter */}
                                                                <div className="text-center mb-6">
                                                                    <p className="text-sm font-medium text-slate-500">
                                                                        Question {currentQuestionIndex + 1} of {selectedAssignment.questions.length}
                                                                    </p>
                                                                </div>

                                                                {/* Question Text */}
                                                                <div className="mb-8">
                                                                    <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                                                                        {Array.isArray(question.question) ? (
                                                                            question.question.map((part, i) =>
                                                                                part.type === "text" ? (
                                                                                    <span key={i}>{part.content}</span>
                                                                                ) : (
                                                                                    <KaTeXWrapper key={i}>{part.content}</KaTeXWrapper>
                                                                                )
                                                                            )
                                                                        ) : (
                                                                            question.question || "Question text not available"
                                                                        )}
                                                                    </h3>
                                                                </div>

                                                                {/* Graphs */}
                                                                {question.graphs &&
                                                                    question.graphs.map((graph, idx) => (
                                                                        <div key={idx} className="flex justify-center mb-6">
                                                                            <JSXGraph
                                                                                equationType={graph.equationType}
                                                                                expr1={graph.expr1}
                                                                                expr2={graph.expr2}
                                                                                range={graph.range || [-10, 10]}
                                                                                width={graph.width || 300}
                                                                                height={graph.height || 200}
                                                                            />
                                                                        </div>
                                                                    ))
                                                                }

                                                                {/* Class Performance Stats */}
                                                                <div className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Class Performance</h4>

                                                                    <div className="flex items-center gap-4 mb-6">
                                                                        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
                                                                                style={{ width: `${percentCorrect}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xl font-bold text-slate-800">{percentCorrect}%</span>
                                                                        <span className="text-sm text-slate-500">Correct ({stats.correct}/{stats.total} attempts)</span>
                                                                    </div>

                                                                    {(questionType === 'mcq' || questionType === 'boolean') && question.options && (
                                                                        <div>
                                                                            <p className="text-xs font-semibold text-slate-400 mb-3">RESPONSE BREAKDOWN</p>
                                                                            <div className="space-y-3">
                                                                                {question.options.map((opt, idx) => {
                                                                                    // Safely handle both simple strings and rich text options
                                                                                    let optStr = "";
                                                                                    if (Array.isArray(opt)) {
                                                                                        optStr = opt.map(p => p.content || "").join(" ");
                                                                                    } else if (typeof opt === 'object' && opt.content) {
                                                                                        optStr = opt.content;
                                                                                    } else {
                                                                                        optStr = String(opt);
                                                                                    }

                                                                                    const count = stats.options[optStr] || 0;
                                                                                    const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                                                                    const isCorrectOpt = isOptionCorrect(opt, answerData);

                                                                                    return (
                                                                                        <div key={idx} className="flex items-center text-sm">
                                                                                            <div className="w-8 font-medium text-slate-400">
                                                                                                {String.fromCharCode(65 + idx)}
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <div className="flex justify-between mb-1">
                                                                                                    <span className={isCorrectOpt ? "text-green-700 font-semibold" : "text-slate-600"}>
                                                                                                        {optStr.substring(0, 50)}{optStr.length > 50 ? "..." : ""}
                                                                                                        {isCorrectOpt && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Correct Answer</span>}
                                                                                                    </span>
                                                                                                    <span className="text-slate-500 text-xs">{count} students ({percentage}%)</span>
                                                                                                </div>
                                                                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                                                    <div
                                                                                                        className={`h-full rounded-full transition-all duration-500 ${isCorrectOpt ? 'bg-green-500' : 'bg-slate-300'}`}
                                                                                                        style={{ width: `${percentage}%` }}
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Question Type Specific Display */}
                                                                {/* Multiple Choice Questions */}
                                                                {(questionType === 'mcq') && question.options && (
                                                                    <div className="space-y-3 mb-8">
                                                                        <p className="text-sm font-medium text-slate-600 mb-3">Answer Choices:</p>
                                                                        {question.options.map((option, idx) => {
                                                                            const isCorrect = isOptionCorrect(option, answerData);
                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    className={`p-4 rounded-lg border-2 transition-all ${isCorrect
                                                                                        ? 'border-green-500 bg-green-50'
                                                                                        : 'border-slate-200 bg-slate-50'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="flex-1">
                                                                                            {Array.isArray(option) ? (
                                                                                                option.map((part, i) =>
                                                                                                    part.type === "text" ? (
                                                                                                        <span key={i}>{part.content}</span>
                                                                                                    ) : (
                                                                                                        <KaTeXWrapper key={i}>{part.content}</KaTeXWrapper>
                                                                                                    )
                                                                                                )
                                                                                            ) : (
                                                                                                <span className="text-slate-700">{String(option)}</span>
                                                                                            )}
                                                                                        </div>
                                                                                        {isCorrect && (
                                                                                            <span className="ml-auto px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                                                                                                CORRECT
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {/* Boolean/True-False Questions */}
                                                                {(questionType === 'boolean') && question.options && (
                                                                    <div className="space-y-3 mb-8">
                                                                        <p className="text-sm font-medium text-slate-600 mb-3">Answer Choices:</p>
                                                                        {question.options.map((option, idx) => {
                                                                            const isCorrect = isOptionCorrect(option, answerData);
                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    className={`p-4 rounded-lg border-2 transition-all ${isCorrect
                                                                                        ? 'border-green-500 bg-green-50'
                                                                                        : 'border-slate-200 bg-slate-50'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="flex-1">
                                                                                            {Array.isArray(option) ? (
                                                                                                option.map((part, i) =>
                                                                                                    part.type === "text" ? (
                                                                                                        <span key={i}>{part.content}</span>
                                                                                                    ) : (
                                                                                                        <KaTeXWrapper key={i}>{part.content}</KaTeXWrapper>
                                                                                                    )
                                                                                                )
                                                                                            ) : (
                                                                                                <span className="text-slate-700">{String(option)}</span>
                                                                                            )}
                                                                                        </div>
                                                                                        {isCorrect && (
                                                                                            <span className="ml-auto px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                                                                                                CORRECT
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {/* Free Response / Word Problems - Show textarea like students see */}
                                                                {(questionType === 'free' || questionType === 'word') && (
                                                                    <div className="mb-8">
                                                                        <p className="text-sm font-medium text-slate-600 mb-3">Answer Input (as students see it):</p>
                                                                        <textarea
                                                                            className="w-full h-32 p-4 border-2 border-slate-300 rounded-lg bg-slate-50"
                                                                            value=""
                                                                            placeholder="Students enter their answer here..."
                                                                            disabled
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Correct Answer Display for All Question Types */}
                                                                {/* Only show for non-MCQ/Boolean (since they have highlighted answers above) */}
                                                                {(questionType !== 'mcq' && questionType !== 'boolean') && (
                                                                    <div className="mb-8">
                                                                        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                                                                            <p className="text-sm font-semibold text-green-800 mb-2">Correct Answer:</p>
                                                                            <div className="text-lg text-slate-800">
                                                                                {answerData ? (
                                                                                    Array.isArray(answerData) ? (
                                                                                        answerData.map((part, i) =>
                                                                                            typeof part === 'object' && part.type === "latex" ? (
                                                                                                <KaTeXWrapper key={i}>{part.content}</KaTeXWrapper>
                                                                                            ) : typeof part === 'object' && part.content ? (
                                                                                                <span key={i}>{part.content}</span>
                                                                                            ) : (
                                                                                                <span key={i}>{String(part)}</span>
                                                                                            )
                                                                                        )
                                                                                    ) : (
                                                                                        String(answerData)
                                                                                    )
                                                                                ) : (
                                                                                    "Answer not available"
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Navigation Buttons */}
                                                                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                                                                    <button
                                                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                                                        disabled={currentQuestionIndex === 0}
                                                                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                    >
                                                                        <ArrowLeft className="w-4 h-4" />
                                                                        Previous
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(selectedAssignment.questions.length - 1, prev + 1))}
                                                                        disabled={currentQuestionIndex === selectedAssignment.questions.length - 1}
                                                                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                    >
                                                                        Next
                                                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Student Results</h3>
                                            <div className="space-y-3">
                                                {assignmentDetail?.studentProgress.map((student) => (
                                                    <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                        <div>
                                                            <p className="font-medium text-slate-800">{student.name}</p>
                                                            <p className="text-sm text-slate-500">
                                                                {student.status === 'Completed'
                                                                    ? `Completed ${new Date(student.completedAt).toLocaleDateString()}`
                                                                    : 'Not yet started'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            {student.status === 'Completed' ? (
                                                                <span className={`px-3 py-1 rounded-full text-sm font-bold
                                                                    ${student.score >= 80 ? 'bg-green-100 text-green-700' :
                                                                        student.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'}`}>
                                                                    {student.score}%
                                                                </span>
                                                            ) : (
                                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-600">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}
