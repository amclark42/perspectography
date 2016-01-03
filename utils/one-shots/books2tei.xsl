<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="xs xsl tei"
  version="2.0">
  
  <xsl:output indent="yes" method="xml"/>
  
  <xsl:variable name="tags">
    <taxonomy xml:id="tag">
      <bibl>Tags</bibl>
      <category xml:id="tag.owned">
        <catDesc>owned</catDesc>
      </category>
      <category xml:id="tag.comics">
        <catDesc>comics</catDesc>
      </category>
      <category xml:id="tag.class">
        <catDesc>classroom reading</catDesc>
      </category>
      <category xml:id="tag.nonfiction">
        <catDesc>nonfiction</catDesc>
      </category>
      <category xml:id="tag.cookbook">
        <catDesc>cookbook</catDesc>
      </category>
      <category xml:id="tag.kickstart">
        <catDesc>Kickstarted</catDesc>
      </category>
    </taxonomy>
  </xsl:variable>
  
  <xsl:template match="text()">
    <xsl:if test="string-length(normalize-space()) > 1">
      <xsl:value-of select="."/>
    </xsl:if>
  </xsl:template>
  <xsl:template match="*" priority="-5"/>
  
  <xsl:template match="/">
    <xsl:processing-instruction name="xml-model">href="file:/media/removable/SD%20Card/out/perspectography.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"</xsl:processing-instruction>
    <TEI xmlns="http://www.tei-c.org/ns/1.0">
      <teiHeader>
        <fileDesc>
          <titleStmt>
            <title>Books I've Read 3.2</title>
          </titleStmt>
          <publicationStmt><p>Just me, Ashley.</p></publicationStmt>
          <sourceDesc><p>None</p></sourceDesc>
        </fileDesc>
        <encodingDesc>
          <classDecl>
            <xsl:copy-of select="$tags"/>
          </classDecl>
        </encodingDesc>
      </teiHeader>
      <text>
        <body>
          <div>
            <listBibl>
              <xsl:apply-templates select="descendant::book"/>
            </listBibl>
          </div>
        </body>
      </text>
    </TEI>
  </xsl:template>
  
  <xsl:template match="book">
    <biblStruct>
      <xsl:copy-of select="@xml:id"/>
      <monogr>
        <xsl:apply-templates select="* except (series | tag)"/>
        <imprint>
          <xsl:if test="tags">
            <xsl:apply-templates select="tags/tag"/>
          </xsl:if>
          <publisher></publisher>
        </imprint>
      </monogr>
      <xsl:apply-templates select="series"/>
    </biblStruct>
  </xsl:template>
  
  <xsl:template match="book/title">
    <title>
      <xsl:value-of select="text()"/>
    </title>
  </xsl:template>
  
  <xsl:template match="series">
    <series>
      <title>
        <xsl:value-of select="title"/>
      </title>
    </series>
  </xsl:template>
  
  <xsl:template match="contributor">
    <xsl:variable name="relation" select="relation/@type"/>
    <xsl:variable name="roleName" select="if ( count($relation) gt 1 ) then
                                            'respStmt'
                                          else if ( matches($relation,'^(Author|Editor|Funder|Publisher)$','i') ) then 
                                            lower-case($relation) 
                                          else 'respStmt'"/>
    <xsl:element name="{$roleName}">
      <xsl:if test="$roleName eq 'respStmt'">
        <xsl:for-each select="$relation">
          <resp>
            <xsl:value-of select="lower-case(.)"/>
          </resp>
        </xsl:for-each>
      </xsl:if>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="relation"/>
  
  <xsl:template match="contributor/name">
    <name ref="creators.xml#{@xml:id}">
      <xsl:value-of select="if ( forename or surname ) then
                              string-join(child::name,' ')
                            else name[1]"/>
    </name>
  </xsl:template>
  
  <xsl:template match="tag">
    <catRef>
      <xsl:attribute name="target">
        <xsl:variable name="currentTag" select="text()"/>
        <xsl:value-of select="concat('#',$tags//category[catDesc/text() eq $currentTag]/@xml:id)"/>
      </xsl:attribute>
    </catRef>
  </xsl:template>
  
</xsl:stylesheet>