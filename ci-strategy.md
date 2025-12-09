# Choice for Continuous integration (trunk-based vs gitflow)

We use Trunk-Based Development for Continuous Integration instead of GitFlow.
Since we have no dedicated release branch, GitFlow would add unnecessary complexity.
Each issue gets its own short-lived trunk branch, merged into main after validation.
This approach enables faster feedback, fewer conflicts, and continuous delivery.
It fits our agile, fast-release workflow better than GitFlow.

# Commit convention
"Type" + ":" + "Message" + "(#IssueID)"

Examples:
fix: Added MCP to deployment diagram (#18)
fix: Added feedback to component diagram (#18)

# Branch naming convention
"Type" + "/" + "IssueID" + "_" + "Description"

Example:
fix/18_Fixing_diagrams_and_description

