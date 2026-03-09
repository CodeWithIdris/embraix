import { Navigate } from "react-router-dom";

// Redirect old case studies route to Stories & Voices
const CaseStudies = () => <Navigate to="/media/stories" replace />;

export default CaseStudies;
