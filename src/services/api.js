export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

export async function callGeminiAPI(base64Data, specificPrompt, currentItemId) {
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    const formData = new FormData();
    formData.append('item_id', currentItemId);
    formData.append('prompt', specificPrompt || "Analiza la imagen.");
    formData.append('image', blob, 'evidence.jpg');

    const response = await fetch(`${API_BASE_URL}/v1/analyze`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Error en el servidor');
    }

    return await response.json();
}

export async function generateReportAPI(reportData) {
    const response = await fetch(`${API_BASE_URL}/v1/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
    });
    
    if (!response.ok) throw new Error("Error generating report");
    return await response.json();
}
