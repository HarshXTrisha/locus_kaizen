'use client'; // This component will handle user interactions

import React from 'react';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';

// Sample data for the current question
const questionData = {
  number: 1,
  text: "The following sentence has four underlined words or phrases. Identify the one underlined word or phrase that must be changed in order for the sentence to be correct.",
  sentence: {
    part1: "The committee ",
    underline1: "have met",
    part2: " and ",
    underline2: "it has",
    part3: " reached ",
    underline4: "a decision",
    part5: " to ",
    underline5: "postpone",
    part6: " the event."
  },
  options: ["have met", "it has", "a decision", "postpone"]
};

export function MainQuestionArea() {
  return (
    <main className="flex-1 p-10">
      <div className="max-w-4xl mx-auto">
        {/* Question Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-slate-800">Question {questionData.number}</h2>
          <div className="flex items-center text-lg">
            <Clock className="mr-2 text-gray-500" size={24} />
            <span className="font-semibold text-slate-800">29:45</span>
            <span className="text-gray-500"> remaining</span>
          </div>
        </div>

        {/* Question Body */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
          <p className="text-lg leading-relaxed text-slate-800 mb-8">
            {questionData.text}
            <br/><br/>
            &ldquo;{questionData.sentence.part1}
            <u className="text-blue-600 cursor-pointer">{questionData.sentence.underline1}</u>
            {questionData.sentence.part2}
            <u className="text-blue-600 cursor-pointer">{questionData.sentence.underline2}</u>
            {questionData.sentence.part3}
            <u className="text-blue-600 cursor-pointer">{questionData.sentence.underline4}</u>
            {questionData.sentence.part5}
            <u className="text-blue-600 cursor-pointer">{questionData.sentence.underline5}</u>
            {questionData.sentence.part6}&rdquo;</p>
          <div className="space-y-4">
            {questionData.options.map((option, index) => (
              <label key={index} className="flex items-center p-4 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
                <input type="radio" name="answer" className="form-radio h-5 w-5 text-green-500 focus:ring-green-500" />
                <span className="ml-4 text-slate-800">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-8">
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-600 font-bold hover:bg-slate-100 transition-colors">
            <ChevronLeft size={20} />
            Previous
          </button>
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 rounded-lg text-yellow-600 font-bold bg-yellow-100 hover:bg-yellow-200 transition-colors">
              Flag for Review
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold bg-green-500 hover:bg-green-600 transition-colors">
              Next Question
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
