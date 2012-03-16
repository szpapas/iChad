#include <stdio.h>
#define BLOCK_SIZE 8

int main ( int argc, char *argv[] )
{
    if ( argc != 3 ) /* argc should be 2 for correct execution */
    {
        /* We print argv[0] assuming it is the program name */
        printf( "usage: %s filename outfile", argv[0] );
    }
    else 
    {
        // We assume argv[1] is a filename to open
        FILE *file = fopen( argv[1], "r" );
        FILE *fo   = fopen( argv[2], "w" );

        /* fopen returns 0, the NULL pointer, on failure */
        if ( file == 0 )
        {
            printf( "Could not open file\n" );
        }
        else 
        {
            int x, count = 0;
            /* read one character at a time from file, stopping at EOF, which
               indicates the end of the file.  Note that the idiom of "assign
               to a variable, check the value" used below works because
               the assignment statement evaluates to the value assigned. */
            
            char bb[100], cc[1000];
            while  ( ( x = fgetc( file ) ) != EOF )
            {
                bb[count] = x;
                count = count + 1;
                
                if (count == BLOCK_SIZE) {
                  
                  cc[0]=(255-bb[7]);
                  cc[1]=(255-bb[0]);
                  cc[2]=(255-bb[4]);
                  cc[3]=(255-bb[3]);
                  cc[4]=(255-bb[6]);
                  cc[5]=(255-bb[1]);
                  cc[6]=(255-bb[5]);
                  cc[7]=(255-bb[2]);
                  
                  fwrite(cc,1,count,fo);
                  
                  count = 0;
                  //printf ("1k bytes read and write...\n");
                }
                //printf( "%c", x );
            }
            
            fwrite(bb,1,count,fo);
            //printf ("%d bytes left to write...\n", count);
            
            fclose( file );
            fclose( fo );
        }
    }
}