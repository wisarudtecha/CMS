
interface ProgressSteps {
    id: string,
    title:string,
    completed:boolean
    current?:boolean
    type?:string
}

interface ProgressStepPrevieProps {
    progressSteps: ProgressSteps[];
    className? : string

}

const ProgressStepPreview: React.FC<ProgressStepPrevieProps> = ({
    progressSteps,

}) => {

    const currentStepIndex = progressSteps.findIndex(step => step.current);
    const progressWidth = currentStepIndex !== -1 ? ((currentStepIndex) / (progressSteps.length - 1)) * 100 : 0;
    // console.log(progressSteps);
    return (
                <div className={` mb-4 `}>
                <div className="relative pt-4">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-0.5 bg-blue-500 transition-all duration-300"
                        style={{ width: `${progressWidth}%` }}
                    ></div>
                    <div className="relative flex justify-between">
                        {progressSteps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center text-center group" style={{ width: "16.66%" }}>
                                <div
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 relative ${step.completed || step.current
                                        ? "bg-blue-500 border-blue-500"
                                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                        }`}
                                >
                                    {step.completed ? (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : step.current ? (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    ) : (
                                        <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                                    )}
                                </div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                                    {step.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

    );
};

export default ProgressStepPreview