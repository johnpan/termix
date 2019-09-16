@echo off 
set _gitOK="OK"
for /f "tokens=*" %%a in ('git status ^| grep nothing') do set _gitOK=%%a
echo ______ %_gitOK%
if "%_gitOK%" neq "nothing to commit, working tree clean" (
    echo ______ Working tree is NOT clean, please commit changes
    goto :eof
)
echo __pull
git pull
echo __push
git push
echo __checkout master
git checkout master
echo __merge develop
git merge develop
echo __push
git push
echo ______ Ready

