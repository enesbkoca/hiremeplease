'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserInput } from '@/components/UserInput';
import { useLoading } from '@/context/LoadingContext';
import Image from 'next/image';

// Testimonial data
const testimonials = [
    {
        id: 1,
        name: "Sarah Johnson",
        role: "Software Engineer",
        company: "TechCorp",
        content: "This tool helped me prepare for my dream job interview. The questions were spot-on and I got the offer!",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "Product Manager",
        company: "InnovateCo",
        content: "I was nervous about my senior PM interview, but the practice questions really helped me feel confident and prepared.",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: 3,
        name: "Emma Rodriguez",
        role: "UX Designer",
        company: "DesignLabs",
        content: "The tailored questions for my UX role were exactly what came up in my interview. Highly recommend!",
        avatar: "https://randomuser.me/api/portraits/women/63.jpg"
    }
];

export default function Home() {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState("");
    const { setIsLoading } = useLoading();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (e.currentTarget.elements && "jobDescription" in e.currentTarget.elements) {
                const jobDescriptionElement = e.currentTarget.elements.jobDescription as HTMLTextAreaElement;
                const jobDescriptionValue = jobDescriptionElement.value;

                // Send job description to the server
                const response = await fetch("/api/jobs", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({description: jobDescriptionValue}),
                });

                if (!response.ok) {
                    throw new Error('Failed to create job');
                }

                const {jobId} = await response.json();
                router.push(`/job/${jobId}`); // Redirect to the job page
            } else {
                console.error("jobDescription element not found in form.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error submitting job description:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-16">
            {/* Hero Section - Side by Side */}
            <section className="pt-8 sm:pt-16 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Text Content */}
                        <div>
                            <div className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full mb-5">
                                AI-Powered Interview Prep
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                                Practice interviews with AI for your dream job
                            </h1>
                            <p className="text-lg text-gray-700 mb-8">
                                <strong>Hire Me Please</strong> uses AI to create personalized interview questions based on your specific job description. Practice your answers, receive real-time feedback, and improve your chances of landing your dream job.
                            </p>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Tailored questions</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Instant feedback</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Practical exercises</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side - Input Form */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4">Generate Interview Questions</h2>
                            <UserInput
                                jobDescription={jobDescription}
                                onJobDescriptionChange={setJobDescription}
                                handleSubmit={handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* How it Works Section - with 4 steps */}
            <section className="bg-gray-50 py-16 rounded-xl">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 font-bold text-xl">1</span>
                            </div>
                            <h3 className="font-semibold mb-2">Paste Job Description</h3>
                            <p className="text-gray-600">Copy and paste the job description you want to prepare for.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 font-bold text-xl">2</span>
                            </div>
                            <h3 className="font-semibold mb-2">Generate Questions</h3>
                            <p className="text-gray-600">Our AI analyzes the job requirements and creates tailored questions.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 font-bold text-xl">3</span>
                            </div>
                            <h3 className="font-semibold mb-2">Practice Answers</h3>
                            <p className="text-gray-600">Respond to questions by text or recording your voice answers.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-blue-600 font-bold text-xl">4</span>
                            </div>
                            <h3 className="font-semibold mb-2">Get Feedback & Improve</h3>
                            <p className="text-gray-600">Receive detailed feedback on your answers and learn how to improve.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Side by Side */}
            <section className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                            <div className="bg-white p-8 rounded-xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-700">Technical Questions</h4>
                                        <p className="text-sm mt-2">Specific to your tech stack and experience level</p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-indigo-700">Behavioral Questions</h4>
                                        <p className="text-sm mt-2">Based on the soft skills from the job description</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-purple-700">Project Scenarios</h4>
                                        <p className="text-sm mt-2">Real-world scenarios you might face on the job</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-700">Detailed Feedback</h4>
                                        <p className="text-sm mt-2">Get insights on how to improve your answers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Comprehensive Interview Preparation</h2>
                        <p className="text-lg text-gray-700 mb-6">
                            Our platform doesn&apos;t just generate generic questions. We create a personalized interview experience that simulates what you&apos;ll face in your actual interview.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex">
                                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Role-specific questions that match your career level</span>
                            </li>
                            <li className="flex">
                                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Detailed AI feedback on content, delivery, and confidence</span>
                            </li>
                            <li className="flex">
                                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>Practice as many times as you need until you&apos;re confident</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="relative w-12 h-12 mr-4 rounded-full overflow-hidden">
                                    <Image 
                                        src={testimonial.avatar} 
                                        alt={testimonial.name}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{testimonial.name}</h3>
                                    <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic">&ldquo;{testimonial.content}&rdquo;</p>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 rounded-xl text-white text-center">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-4">Ready to land your dream job?</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">Get personalized interview questions, practice your answers, and receive feedback to improve your interview skills.</p>
                    <a href="#top" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition text-lg">
                        Get Started Now
                    </a>
                </div>
            </section>
        </div>
    );
}