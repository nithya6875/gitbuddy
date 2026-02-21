/**
 * =============================================================================
 * COMMIT.TS - Smart Commit Message Generator
 * =============================================================================
 *
 * Analyzes staged changes and generates conventional commit messages.
 * The dog "sniffs" your changes and suggests what you did!
 */
export interface CommitSuggestion {
    type: string;
    scope: string | null;
    description: string;
    body: string[];
    filesChanged: FileChange[];
    stats: {
        additions: number;
        deletions: number;
        files: number;
    };
}
interface FileChange {
    file: string;
    additions: number;
    deletions: number;
}
/**
 * Checks if there are staged changes.
 */
export declare function hasStagedChanges(): boolean;
/**
 * Analyzes staged changes and generates a commit suggestion.
 */
export declare function analyzeChanges(): CommitSuggestion;
/**
 * Formats the commit message.
 */
export declare function formatCommitMessage(suggestion: CommitSuggestion): string;
/**
 * Executes git commit with the given message.
 */
export declare function executeCommit(message: string): {
    success: boolean;
    error?: string;
};
/**
 * Builds the commit suggestion screen.
 */
export declare function buildCommitScreen(suggestion: CommitSuggestion): string;
/**
 * Builds the no staged changes screen.
 */
export declare function buildNoStagedScreen(): string;
/**
 * Builds the commit success screen.
 */
export declare function buildCommitSuccessScreen(message: string): string;
export {};
//# sourceMappingURL=commit.d.ts.map