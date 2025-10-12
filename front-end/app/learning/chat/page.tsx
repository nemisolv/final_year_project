// front-end/app/learning/grammar/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, CheckCircle2, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { grammarService, GrammarCheckResponse, GrammarError } from '@/services/grammarService';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export default function GrammarPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<GrammarCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckGrammar = async () => {
    if (!text.trim()) {
      toast.info('Please enter some text to check.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await grammarService.check(text);
      setResult(response);
      if (response.errors.length === 0) {
        toast.success('Great job! No errors found.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to check grammar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHighlightedText = () => {
    if (!result || !result.errors.length) {
      return <p>{result?.originalText || ''}</p>;
    }

    let lastIndex = 0;
    const parts: JSX.Element[] = [];
    const sortedErrors = [...result.errors].sort((a, b) => a.offset - b.offset);

    sortedErrors.forEach((error, index) => {
      // Phần text không lỗi
      parts.push(<span key={`text-${index}`}>{result.originalText.substring(lastIndex, error.offset)}</span>);
      
      // Phần text bị lỗi (highlight và có popover)
      const errorText = result.originalText.substring(error.offset, error.offset + error.errorLength);
      parts.push(
        <Popover key={`error-${index}`}>
          <PopoverTrigger asChild>
            <span className="bg-yellow-200 dark:bg-yellow-800 rounded-md px-1 cursor-pointer">
              {errorText}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Grammar Suggestion</p>
              <p className="text-sm">{error.message}</p>
              {error.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {error.suggestions.map((suggestion, i) => (
                      <Badge key={i} variant="outline">{suggestion}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      );
      lastIndex = error.offset + error.errorLength;
    });

    // Phần text còn lại
    parts.push(<span key="text-last">{result.originalText.substring(lastIndex)}</span>);
    return <div className="leading-relaxed whitespace-pre-wrap">{parts}</div>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              AI Grammar Checker
            </CardTitle>
            <CardDescription>
              Write your English text below and our AI will check for grammatical errors and provide suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing here... For example: 'He go to school yesterday.'"
              rows={8}
              className="mb-4"
              disabled={isLoading}
            />
            <Button onClick={handleCheckGrammar} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Check Grammar
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Original Text with highlights:</h3>
                <div className="p-4 border rounded-md bg-muted/20">
                    {renderHighlightedText()}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-green-500"/>
                    Corrected Version:
                </h3>
                <p className="p-4 border rounded-md bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                    {result.correctedText}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}