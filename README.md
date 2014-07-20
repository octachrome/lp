LP solver
=========

This project reads simple linear programming problems in [MPS](http://lpsolve.sourceforge.net/5.5/mps-format.htm) or [Xpress LP](http://lpsolve.sourceforge.net/5.5/Xpress-format.htm) format, and solves them.

It also explores the functional style of writing parsers described in [Implementing Functional Languages:
a tutorial, by Simon Peyton Jones and David R Lester](http://research.microsoft.com/en-us/um/people/simonpj/Papers/pj-lester-book/).

Limitations:

- Only <=,  >= and = constraints are supported
- Continuous variables only
- Only positive upper and lower bounds expressions (MPS only); all variables must be non-negative
- No constants except on RHS of constraints
