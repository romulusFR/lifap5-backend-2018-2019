PANDOC=pandoc
PANDOCFLAGS=-f markdown -t html --toc --toc-depth=4 -s --highlight-style=tango 
MDEXT=md
HTMLEXT=html

SERVER=LIFAP5-Backend
SEMESTER=2019P

LAB_SHEET= $(UE)-$(SEMESTER)-$(SOURCE).$(HTMLEXT)
LAB_ZIP= $(UE)-$(SEMESTER)-Projet-Frontend.$(ZIPEXT)
DOC_SERVER=$(SERVER).$(HTMLEXT)

all: $(DOC_SERVER)

$(DOC_SERVER): $(SERVER).$(MDEXT) 
	$(PANDOC) $(PANDOCFLAGS) -o $(DOC_SERVER) $^

clean:
	find . -type f -name "*~" -delete
