ROOT=http://localhost:2727/api/v0

if [[ $1 == "prod" ]]; then
  ROOT=https://open-api.thenational.academy/api/v0
fi

TESTS=0

# FILTER="/key-stages/ks3/subject/maths/assets"

title() {
  if [[ $FILTER == "" ]]; then
    echo "\n\033[90m$1\033[0m"
  fi
}

get() {
  URL=$1

  if [[ $FILTER ]]; then
    if [[ $FILTER != $URL ]]; then
      return
    fi
  fi

  Q=${2:-"."}
  ((TESTS++))
  OUT=$(curl -s -X 'GET' "$ROOT$1" -H 'accept: application/json' \
    -H "Authorization: Bearer $API_KEY" | jq "$Q" 2>&1)

  if [[ $Q == "." ]]; then
    echo $OUT | jq
  fi

  status=$?  # Capture the exit status of jq

  if echo $OUT | grep -q 'jq: error'; then
    echo "\033[31mFail\033[0m $URL"
    return
  fi
  if [ $status -ne 0 ]; then
    echo "\033[31mFail\033[0m $URL"
    return
  fi

  echo "\033[32mPass\033[0m $URL"
}

clear

title "# LESSONS"
get "/lessons/developing-an-understanding-of-the-wild-robot-through-rich-discussions/summary" ".code | not"
get "/lessons/learning-about-the-context-of-whale-rider/summary" ".code"

title "# UNITS"
get "/units/the-unforgotten-coat-book-club/summary" ".code | not"
get "/units/victorian-childhood-non-fiction-reading-and-writing/summary" '.code == "NOT_FOUND"'

title "# ASSETS"
get "/key-stages/ks1/subject/english/assets" '.code == "NOT_FOUND"'
get "/key-stages/ks1/subject/maths/assets" '.code? != "NOT_FOUND"'
get "/key-stages/ks3/subject/english/assets" '.code? | not'

title "# DOWNLOADS"

get "/download/exploring-titles-in-unseen-poetry/type/video" '.code == "NOT_FOUND"'
get "/download/child-workers-in-the-victorian-era/type/video" '.code? | not'
get "/download/imagining-you-are-the-characters-the-three-billy-goats-gruff/type/video" ".code? | not"


get "/download/the-power-of-rhetoric-in-writing/type/video" '.code? | not'

get "/units/writing-rhetoric-1e51/summary" '.code == "NOT_FOUND"'
get "/lessons/writing-an-effective-speech-using-rhetoric-6xj32r/summary" '.code == "NOT_FOUND"'
get "/lessons/writing-an-effective-speech-using-rhetoric-6xj32r/assets" '.code == "NOT_FOUND"'
get "/lessons/the-power-of-rhetoric-in-writing/assets" '.code? | not'

get "/search/lessons?q=run&keyStage=ks1&subject=english" '.code? | not'

get "/lessons/theatre-trips/assets" '.code == "NOT_FOUND"'

# get "/key-stages/ks3/english/assets?unit=victorian-childhood-non-fiction-reading-and-writing"

get $FILTER
title "FIN $TESTS tests run"
