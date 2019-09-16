@echo off 
set _gitOK="OK"
for /f "tokens=*" %%a in ('git status ^| grep nothing') do set _gitOK=%%a
echo ______ %_gitOK%
if "%_gitOK%" neq "nothing to commit, working tree clean" (
    echo ______ Working tree is NOT clean, please commit changes
    goto :eof
)
git pull
echo ______ merge develop into master and push master
git checkout master
git merge develop
git push
echo ______ Ready