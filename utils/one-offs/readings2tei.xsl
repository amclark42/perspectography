<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  exclude-result-prefixes="xs xsl tei"
  version="2.0">
  
  <xsl:output indent="yes" method="xml"/>
  
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
      </teiHeader>
      <text>
        <body>
          <listEvent>
            <xsl:apply-templates select="descendant::event"/>
          </listEvent>
        </body>
      </text>
    </TEI>
  </xsl:template>
  
  <xsl:template match="event">
    <event>
      <xsl:copy-of select="@* except @ref"/>
      <p>
        <xsl:copy-of select="text()"/>
        <xsl:text> </xsl:text>
        <ref target="booksRead_3.0.xml#{if ( @ref ) then @ref else parent::book/@xml:id}">
          <xsl:value-of select="parent::book/title/text()"/>
        </ref>
        <xsl:text>.</xsl:text>
      </p>
    </event>
  </xsl:template>
  
</xsl:stylesheet>