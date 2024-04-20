'use client'
import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/Tooltip';

interface CardProps {
  title: string; // Assuming each card has a title
}

const Card: React.FC<CardProps> = ({ title }) => {
  // State to toggle edit mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // State to hold the editable title value
  const [editableTitle, setEditableTitle] = useState<string>(title);

  // Function to handle the title change
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(event.target.value);
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="card bg-white border rounded p-2">
      <div className="card-footer">
        <div className="flex justify-between items-center">
          {!isEditing ? (
            <>
              <span className="flex-grow">{editableTitle}</span>
              {/* Edit Icon */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <button onClick={toggleEditMode} className="ml-2 text-black hidden group-hover:block">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit title</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <div className="flex-grow">
              <input
                type="text"
                value={editableTitle}
                onChange={handleTitleChange}
                onBlur={toggleEditMode} // Optionally, exit edit mode when the input loses focus
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
