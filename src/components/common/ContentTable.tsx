'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Hash } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  level: number;
  children?: ContentItem[];
}

interface ContentTableProps {
  items: ContentItem[];
  className?: string;
}

export function ContentTable({ items, className = '' }: ContentTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const scrollToSection = (itemId: string) => {
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderItem = (item: ContentItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const paddingLeft = depth * 16;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center py-2 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
            depth > 0 ? 'ml-4' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleItem(item.id);
            } else {
              scrollToSection(item.id);
            }
          }}
        >
          {hasChildren ? (
            <button
              className="mr-2 p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <Hash className="h-3 w-3 mr-2 text-gray-400" />
          )}
          <span className="truncate">{item.title}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Table of Contents</h3>
      </div>
      <div className="py-2 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p className="text-sm">No content sections available</p>
          </div>
        ) : (
          items.map((item) => renderItem(item))
        )}
      </div>
    </div>
  );
}

// Helper function to automatically generate content table from page headings
export function generateContentTable(): ContentItem[] {
  if (typeof window === 'undefined') return [];

  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const items: ContentItem[] = [];
  const stack: ContentItem[] = [];

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const title = heading.textContent || '';
    const id = heading.id || `heading-${index}`;

    // Set the id if it doesn't exist
    if (!heading.id) {
      heading.id = id;
    }

    const item: ContentItem = {
      id,
      title,
      level,
      children: []
    };

    // Find the appropriate parent
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      items.push(item);
    } else {
      if (!stack[stack.length - 1].children) {
        stack[stack.length - 1].children = [];
      }
      stack[stack.length - 1].children!.push(item);
    }

    stack.push(item);
  });

  return items;
}
