# GitHub Submission Notes

Use this checklist before submitting the repository for internship evaluation.

## Checklist

- [ ] Add your name and internship details if required
- [ ] Confirm `.env` file is not uploaded
- [ ] Add screenshots inside the `screenshots` folder
- [ ] Test login for admin, agent, and user
- [ ] Test complaint creation
- [ ] Test admin assignment
- [ ] Test agent status update
- [ ] Test feedback submission
- [ ] Update repository URL in README setup section

## Suggested Commit Flow

If you are pushing this as a new repository, use meaningful commits instead of one unclear commit.

Example:

```bash
git add backend package.json .gitignore
git commit -m "Set up backend API and database models"

git add frontend
git commit -m "Create React frontend and role based pages"

git add docs README.md screenshots
git commit -m "Add project documentation for internship submission"
```

## Important

Do not push actual `.env` files or database credentials to GitHub.
