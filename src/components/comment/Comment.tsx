// Comment.tsx

import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useEffect, useRef, useState } from "react";
import { CaseHistory, useGetCaseHistoryQuery } from "@/store/api/caseApi"; // **MODIFIED**: Imported useGetCaseHistoryQuery
import { usePostAddCaseHistoryMutation } from "@/store/api/caseApi";

interface CommentsProps {
    // **REMOVED**: comment prop is no longer needed
    isOpen: boolean; // **ADDED**: To control when data fetching occurs
    caseId: string;
    currentUsername?: string;
}

export const Comments: React.FC<CommentsProps> = ({
    isOpen,
    caseId,
    currentUsername = "Current User"
}) => {
    const [newCommentMessage, setNewCommentMessage] = useState<string>('');
    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const [commentsData, setCommentsData] = useState<CaseHistory[]>([]);

    // **ADDED**: RTK Query hook for fetching comment history
    // The `skip` option prevents fetching until `isOpen` is true
    const { data: fetchedComments, isLoading: isFetchingComments, error: fetchError } = useGetCaseHistoryQuery(
        { caseId },
        { skip: !isOpen }
    );

    const [addCaseHistory, { isLoading: isAddingComment, error: addCommentError }] = usePostAddCaseHistoryMutation();

    // **MODIFIED**: Effect now listens for fetched data from the hook
    useEffect(() => {
        if (fetchedComments?.data) {
            setCommentsData(fetchedComments.data);
        }
    }, [fetchedComments]);

    const handleNewComment = async () => {
        if (newCommentMessage.trim() === '') {
            return;
        }

        try {
            const newCommentData = {
                caseId: caseId,
                fullMsg: newCommentMessage.trim(),
                jsonData: "",
                type: "comment",
                username: currentUsername
            };

            // Call the mutation
            addCaseHistory(newCommentData).unwrap();
            
            // Optimistically update the UI for a better user experience
            const optimisticComment: CaseHistory = {
                id: Date.now(),
                orgId: commentsData[0]?.orgId || "",
                caseId: caseId,
                username: currentUsername,
                type: "comment",
                fullMsg: newCommentMessage.trim(),
                jsonData: "",
                createdAt: new Date().toISOString(),
                createdBy: currentUsername
            };
            setCommentsData((prevComments) => [...prevComments, optimisticComment]);
            
            // Clear the input field
            setNewCommentMessage('');

        } catch (err) {
            console.error('Failed to add comment:', err);
            // Optionally, remove the optimistic update on failure
        }
    };

    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [commentsData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleKeyDownComment = (event: any) => {
        if (event.key === 'Enter') {
            handleNewComment()
        }
    };

    // **ADDED**: Helper to render the main content area
    const renderContent = () => {
        if (isFetchingComments) {
            return (
                <div className="flex justify-center items-center h-full text-gray-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading comments...</span>
                </div>
            );
        }

        if (fetchError) {
            return (
                <div className="flex justify-center items-center h-full text-red-500">
                    <p>Failed to load comments.</p>
                </div>
            );
        }

        if (commentsData.length === 0) {
            return (
                <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                        <svg className="mx-auto h-8 w-8 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No comment history available</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Be the first to add a comment</p>
                    </div>
                </div>
            );
        }

        return commentsData.map((comment: CaseHistory) => (
            <div
                key={comment.id}
                className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors duration-150"
            >
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-blue-500 dark:text-blue-500">{comment.createdBy}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{comment.fullMsg}</p>
            </div>
        ));
    };


    return (
        <div>
            <div
                className="bg-gray-100 dark:bg-gray-800 my-2 rounded-lg overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-700 shadow-inner"
                style={{ height: '10em' }}
                ref={commentsContainerRef}
            >
                {renderContent()}
            </div>

            {addCommentError && (
                <div className="text-red-500 text-sm mb-2">
                    Failed to add comment. Please try again.
                </div>
            )}

            <div className="flex gap-3 mt-3">
                <div className="flex-1">
                    <Input
                        placeholder="Enter your comment..."
                        value={newCommentMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCommentMessage(e.target.value)}
                        onKeyDown={handleKeyDownComment}
                        className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                        disabled={isAddingComment}
                    />
                </div>
                <Button
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    variant="outline-no-transparent"
                    onClick={handleNewComment}
                    disabled={newCommentMessage.trim() === '' || isAddingComment}
                >
                    {isAddingComment ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                        </>
                    ) : (
                        <div className="flex text-gray-900 dark:text-gray-300">
                            <svg
                                className="w-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                            <span>Comment</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
};