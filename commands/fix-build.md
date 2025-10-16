---
description: Fix all build and compilation errors in the codebase
---

The application is working the way I want, but there are build errors. 

1. Run get_compilation_errors or a typecheck on /src. 
2. Fix all the errors (if many similar ones, assign a general purpose agent to each in parallel). Read files completely to understand how they work, do not be lazy.
3. If any error indicates a more concerning issue, please bring it up first, for further guidance.
4. Repeat until get_compilation_errors/the typecheck no longer shows errors
5. Run the build
6. Commit and push changes