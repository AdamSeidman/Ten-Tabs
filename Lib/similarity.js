// Calculate cosine similarity
const cosineSimilarity = (vec1, vec2) => {
    const terms1 = new Set(Object.keys(vec1));
    const terms2 = new Set(Object.keys(vec2));
    const intersection = [...terms1].filter(term => terms2.has(term));
    const dotProduct = intersection.reduce((acc, term) => {
        const weight1 = vec1[term];
        const weight2 = vec2[term];
        return acc + (weight1 * weight2);
    }, 0);
    const mag1 = Math.sqrt(Object.values(vec1).reduce((acc, weight) => acc + weight ** 2, 0));
    const mag2 = Math.sqrt(Object.values(vec2).reduce((acc, weight) => acc + weight ** 2, 0));
    return dotProduct / (mag1 * mag2);
};

const getSimilarity = function (phrase1, phrase2) {
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    
    // Tokenize phrases
    const tokenizePhrase = (phrase) => phrase.toLowerCase().split(/\W+/);
    
    const tokens1 = tokenizePhrase(phrase1);
    const tokens2 = tokenizePhrase(phrase2);
    
    // Add documents to the model
    tfidf.addDocument(tokens1);
    tfidf.addDocument(tokens2);
    
    // Get TF-IDF vectors
    const vec1 = tfidf.documents[0];
    const vec2 = tfidf.documents[1];
    
    delete vec1['__key'];
    delete vec2['__key'];

    const similarity = cosineSimilarity(vec1, vec2);
    return similarity
}
