# Poppler Installer
# Author: Tom Bellis

# Definitions
version=1.0
poppler_url="https://poppler.freedesktop.org/poppler-0.78.0.tar.xz"
poppler_data_url="https://poppler.freedesktop.org/poppler-data-0.4.9.tar.gz"
poppler_tar=${poppler_url##*/}
poppler_version=${poppler_tar/.tar.xz/}
poppler_data_tar=${poppler_data_url##*/}
poppler_data_version=${poppler_data_tar/.tar.gz/}
test_silent=false

# Help function
help()
{
    echo "Usage: ./poppler.sh [-h display help] [-t run 'pdftocairo' test command]"
    exit 1
}

test_command()
{
    if [ $test_silent == true ]; then
        pdftocairo -h 1>>/dev/null 2>>/dev/null || error ${LINENO} "Test failed"
    else
        pdftocairo -h 1>>/dev/null 2>>/dev/null && echo -e "\e[0mPoppler-utils are \e[32minstalled\e[0m." || echo -e "\e[0mPoppler-utils are \e[1mNOT\e[0m \e[31minstalled\e[0m."
    fi
}

# Error handling
error() {
  local pid=$$
  local parent_lineno="$1"
  local message="$2"
  local code="${3:-1}"
  if [[ -n "$message" ]] ; then
    echo -e "\e[31mError \e[0m on or near line ${parent_lineno}: \e[101m${message}; \e[0m exiting with status ${code}"
  else
    echo "Error on or near line ${parent_lineno}; exiting with status ${code}"
  fi
  kill -s TERM $pid
  exit "${code}"
}

# Get flags
while getopts h,t option
do
    case "${option}"
    in
        h) help;;
        t) test_command; exit 1;;
        [?]) help;;
    esac
done



apt_update()
{
    # Update the apt repo
    apt-get update 1>> /dev/null 2>>/dev/null || error ${LINENO} "Failed to run apt-get update"
}

prerequisties()
{
    apt-get install cmake make build-essential gcc libjpeg-turbo-progs libpng-dev curl -y 1 >> /dev/null 2>> /dev/null  ||  error ${LINENO} "Failed to install core packages"
}

curl_poppler()
{
    mkdir poppler 2>>/dev/null 1>>/dev/null
    cd poppler
    curl ${poppler_url} -O 1>> /dev/null 2>>/dev/null || error ${LINENO} "Unable to curl ${poppler_url}"
    curl ${poppler_data_url} -O 1>> /dev/null 2>>/dev/null || error ${LINENO} "Unable to curl ${poppler_data_url}"
}

untar_poppler()
{
    cd poppler
    tar -xJf ${poppler_tar} 1>> /dev/null 2>>/dev/null || error ${LINENO} "Unable to untar ${poppler_url##*/}"
    tar -xzf ${poppler_data_tar} 1>> /dev/null 2>>/dev/null || error ${LINENO} "Unable to untar ${poppler_data_url##*/}"
}

make_poppler()
{
    # Make poppler
    cd poppler
    cd ${poppler_version} || error ${LINENO} "Unable to enter folder ${poppler_version}"
    cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr 1>>//dev/null 2>>/dev/null
    make 1>>//dev/null 2>>/dev/null || error ${LINENO} "Unable to make ${poppler_version}"
    make install 1>>//dev/null 2>>/dev/null || error ${LINENO} "Unable to make install ${poppler_version}"
}

make_poppler_data()
{
    cd poppler
    cd ${poppler_data_version} || error ${LINENO} "Unable to enter folder ${poppler_data_version}"
    make prefix=/usr install 1>>//dev/null 2>>/dev/null || error ${LINENO} "Unable to make ${poppler_data_version}"
}

showLoading()
{
    mypid=$!
    loadingText=$1

    echo -ne "$loadingText\r"

    while kill -0 $mypid 2>/dev/null; do
        echo -ne "$loadingText.\r"
        sleep 0.5
        echo -ne "$loadingText..\r"
        sleep 0.5
        echo -ne "$loadingText...\r"
        sleep 0.5
        echo -ne "\r\033[K"
        echo -ne "$loadingText\r"
        sleep 0.5
    done

    echo -e "$loadingText...\e[32m COMPLETE \e[0m"
}

main()
{
    # Apt-get update
    apt_update & showLoading "Updating apt-get repository"
    prerequisties & showLoading "Installing pre-requisites packages"
    curl_poppler & showLoading "Downloading ${poppler_version} and ${poppler_data_version}"
    untar_poppler & showLoading "Untaring poppler"
    make_poppler & showLoading "Making ${poppler_version}"
    make_poppler_data & showLoading "Making ${poppler_data_version}"
    test_silent=true
    test_command & showLoading "Testing poppler-utils" || error ${LINENO} "Test failed"
    # Finished result
    echo -e "\e[7mPoppler-utils\e[0m are now \e[32minstalled\e[0m."
}


# find user account
if [ "$(whoami)" != 'root' ]; then
    echo -e "Run this script as \e[31mroot \e[0mor try \e[7m sudo ./poppler.sh \e[0m"
    exit 1
else
    # Begin display splash
    cat ./splash
    echo -e "\n"
    echo -e "\e[40m\e[97mPoppler Installer \e[0m"
    echo -e "\e[40m\e[97mVersion: $version \e[0m"
    echo -e "\e[40m\e[97mAuthor: Tom Bellis \e[0m \n"
    echo -e  "\e[1mNB: Ensure you are executing this script with a privileged account e.g \e[91mroot \e[0m\n"

    # RUN PROGRAM
    main
fi
